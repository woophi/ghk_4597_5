import { BottomSheet } from '@alfalab/core-components/bottom-sheet';
import { ButtonMobile } from '@alfalab/core-components/button/mobile';
import { CalendarMobile } from '@alfalab/core-components/calendar/mobile';
import { Checkbox } from '@alfalab/core-components/checkbox';
import { Gap } from '@alfalab/core-components/gap';
import { Input } from '@alfalab/core-components/input';
import { SelectMobile } from '@alfalab/core-components/select/mobile';
import { Switch } from '@alfalab/core-components/switch';
import { Tag } from '@alfalab/core-components/tag';
import { Typography } from '@alfalab/core-components/typography';
import { CalendarMIcon } from '@alfalab/icons-glyph/CalendarMIcon';
import { ChevronRightMIcon } from '@alfalab/icons-glyph/ChevronRightMIcon';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import rubIcon from './assets/rub.png';
import { LS, LSKeys } from './ls';
import { appSt } from './style.css';
import { ThxSpinner } from './thx/ThxLayout';
import { sendDataToGA, sendDataToGACalc } from './utils/events';
import { round } from './utils/round';

const min = 2000;
const max = 3_000_000;

const chips = [2000, 5000, 15000, 25000];
const chipsIncome = [
  {
    title: 'До 80 000 ₽',
    value: 80_000,
  },
  {
    title: '80 001 ₽ – 150 000 ₽',
    value: 150_000,
  },
  {
    title: '150 001 ₽ и более',
    value: 150_001,
  },
];

const MAX_GOV_SUPPORT = 360000;
const TAX = 0.13;
const INVEST_DURATION = 15;
const INTEREST_RATE = 0.07;
function calculateSumContributions(monthlyPayment: number, additionalContribution: number): number {
  return round(additionalContribution + monthlyPayment * 11 + monthlyPayment * 12 * (INVEST_DURATION - 1), 2);
}
function calculateStateSupport(monthlyPayment: number, subsidyRate: number): number {
  const support = monthlyPayment * subsidyRate * 10 * 12;
  return round(Math.min(support, MAX_GOV_SUPPORT), 2);
}
function calculateInvestmentIncome(
  firstDeposit: number,
  monthlyPayment: number,
  subsidyRate: number,
  interestRate: number,
): number {
  const annualPayment = monthlyPayment * 12;
  const adjustedPayment = Math.min(firstDeposit, monthlyPayment * subsidyRate * 12);
  return round(
    ((annualPayment + adjustedPayment + firstDeposit) * (Math.pow(1 + interestRate, INVEST_DURATION) - 1)) /
      (interestRate * 2),
    2,
  );
}
function calculateTaxRefund(sumContributions: number, taxRate: number): number {
  return round(sumContributions * taxRate, 2);
}

const addSome = 36_000;
const sduiLink =
  'alfabank://sdui_screen?screenName=InvestmentLongread&fromCurrent=true&endpoint=v1/invest-main-screen-view/investment-longread/45411%3flocation=GH%26campaignCode=AM_calc';

type OptionKey = 'per_month' | 'per_week' | 'per_quarter' | 'per_annual';

const OPTIONS = [
  { key: 'per_month', content: 'Раз в месяц' },
  { key: 'per_week', content: 'Раз в неделю' },
  { key: 'per_quarter', content: 'Раз в квартал' },
  { key: 'per_annual', content: 'Раз в год' },
];

export const App = () => {
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(true);
  const [error, setError] = useState('');
  const [errorAutoSum, setErrorAutomSum] = useState('');
  const [sum, setSum] = useState('');
  const [autoSum, setAutoSum] = useState('');
  const [perItem, setPerItem] = useState<OptionKey>('per_month');
  const [thxShow, setThx] = useState(LS.getItem(LSKeys.ShowThx, false));
  const [openCalendar, setOpenCalendar] = useState(false);
  const [openCalc, setOpenCalc] = useState(false);
  const [payDate, setPayDate] = useState(dayjs().add(1, 'month').toDate().toISOString());
  const [calcData, setCalcData] = useState<{
    incomeValue: number;
    firstDeposit: number;
    monthlyDeposit: number;
    taxInvest: boolean;
  }>({
    firstDeposit: 72_000,
    incomeValue: 80_000,
    monthlyDeposit: 6_000,
    taxInvest: false,
  });
  const subsidyRate = calcData.incomeValue === 80_000 ? 1 : calcData.incomeValue === 150_000 ? 0.5 : 0.25;
  const deposit15years = calculateSumContributions(calcData.monthlyDeposit, calcData.firstDeposit);
  const taxRefund = calculateTaxRefund(deposit15years, TAX);
  const govCharity = calculateStateSupport(calcData.monthlyDeposit, subsidyRate);
  const investmentsIncome = calculateInvestmentIncome(
    calcData.firstDeposit,
    calcData.monthlyDeposit,
    subsidyRate,
    INTEREST_RATE,
  );
  const total = investmentsIncome + govCharity + (calcData.taxInvest ? taxRefund : 0) + deposit15years;

  useEffect(() => {
    if (!LS.getItem(LSKeys.UserId, null)) {
      LS.setItem(LSKeys.UserId, Date.now());
    }
  }, []);

  useEffect(() => {
    setCalcData(d => ({ ...d, firstDeposit: Number(sum) }));
  }, [sum]);

  useEffect(() => {
    setCalcData(d => ({ ...d, monthlyDeposit: Number(autoSum) }));
  }, [autoSum]);

  useEffect(() => {
    switch (perItem) {
      case 'per_month':
        setPayDate(dayjs().add(1, 'month').toDate().toISOString());
        break;
      case 'per_week':
        setPayDate(dayjs().add(1, 'week').toDate().toISOString());
        break;
      case 'per_quarter':
        setPayDate(dayjs().add(3, 'month').toDate().toISOString());
        break;
      case 'per_annual':
        setPayDate(dayjs().add(1, 'year').toDate().toISOString());
        break;

      default:
        break;
    }
  }, [perItem]);

  const submit = () => {
    if (!sum) {
      setError('Введите сумму взноса');
      return;
    }
    if (checked && !autoSum) {
      setErrorAutomSum('Введите сумму автоплатежа');
      return;
    }

    sendDataToGA({
      auto: checked ? `[${perItem.replace('per_', '')},${autoSum}]` : '[]',
      sum: Number(sum),
      id: LS.getItem(LSKeys.UserId, 0) as number,
    }).then(() => {
      LS.setItem(LSKeys.ShowThx, true);
      setThx(true);
      setLoading(false);
    });
  };

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (error) {
      setError('');
    }

    setSum(e.target.value);
  };
  const handleChangeInputAutoSum = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (errorAutoSum) {
      setErrorAutomSum('');
    }

    setAutoSum(e.target.value);
  };
  const handleBlurInput = () => {
    const value = Number(sum);

    if (value < min) {
      setSum('2000');
      return;
    }
    if (value > max) {
      setSum('3000000');
      return;
    }
  };

  const handleBlurInputCalc1 = () => {
    const value = Number(sum);

    if (value < min) {
      setCalcData({ ...calcData, firstDeposit: min });
      return;
    }
  };

  const handleBlurInputCalc2 = () => {
    const value = Number(sum);

    if (value < min) {
      setCalcData({ ...calcData, monthlyDeposit: min });
      return;
    }
    if (value > max) {
      setCalcData({ ...calcData, monthlyDeposit: max });
      return;
    }
  };

  const goToSdui = () => {
    window.gtag('event', 'inf_4597_var5');
    window.location.replace(sduiLink);
  };

  const handleOpenCalc = () => {
    window.gtag('event', 'calc_4597_var5');
    setOpenCalc(true);
  };

  const handleCloseCalc = () => {
    setOpenCalc(false);
    sendDataToGACalc({
      id: LS.getItem(LSKeys.UserId, 0) as number,
      calc: `${calcData.incomeValue},${calcData.firstDeposit},${calcData.monthlyDeposit},${calcData.taxInvest ? 'T' : 'F'}`,
    });
  };

  const handleSwitchToggle = () => {
    window.gtag('event', 'switch_4597_var5');
    setChecked(prevState => !prevState);
  };

  if (thxShow) {
    return <ThxSpinner />;
  }

  return (
    <>
      <div className={appSt.container}>
        <Typography.TitleResponsive style={{ marginTop: '1rem' }} tag="h1" view="medium" font="system" weight="semibold">
          Сумма взноса
        </Typography.TitleResponsive>

        <div>
          <Typography.Text view="primary-small" color="secondary" tag="p" defaultMargins={false}>
            Счёт списания
          </Typography.Text>

          <div className={appSt.banner}>
            <img src={rubIcon} width={48} height={48} alt="rubIcon" />

            <Typography.Text view="primary-small" weight="medium">
              Текущий счёт
            </Typography.Text>
          </div>
        </div>

        <Input
          hint="От 2 000 до 3 000 000 ₽"
          type="number"
          min={min}
          max={max}
          label="Сумма взноса"
          error={error}
          value={sum}
          onChange={handleChangeInput}
          onBlur={handleBlurInput}
          block
          pattern="[0-9]*"
        />

        <div>
          <Swiper spaceBetween={12} slidesPerView="auto">
            {chips.map(chip => (
              <SwiperSlide key={chip} className={appSt.swSlide}>
                <Tag view="filled" size="xxs" shape="rectangular" onClick={() => setSum(String(chip))}>
                  {chip.toLocaleString('ru')} ₽
                </Tag>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className={appSt.boxGreen} onClick={goToSdui}>
          <Typography.Text view="secondary-medium">
            {Number(sum) >= addSome ? (
              'Условия выполнены. После пополнения вам начислят кэшбэк в подарок'
            ) : sum ? (
              <>
                Пополните еще на <span style={{ fontWeight: 700 }}>{(addSome - Number(sum)).toLocaleString('ru')} ₽</span> –
                получите кэшбэк в подарок. Действует до 15.04
              </>
            ) : (
              <>
                Пополните на <span style={{ fontWeight: 700 }}>{addSome.toLocaleString('ru')}</span> – получите кэшбэк в
                подарок. Действует до 15.04
              </>
            )}
          </Typography.Text>

          <ChevronRightMIcon />
        </div>

        <Switch block reversed checked={checked} label="Пополнять регулярно" onChange={handleSwitchToggle} />

        {checked && (
          <>
            <Input
              type="number"
              label="Сумма автоплатежа"
              labelView="outer"
              error={errorAutoSum}
              value={autoSum}
              onChange={handleChangeInputAutoSum}
              block
              pattern="[0-9]*"
            />

            <SelectMobile
              options={OPTIONS}
              label="Буду вносить"
              labelView="outer"
              block
              selected={perItem}
              onChange={p => setPerItem((p.selected?.key ?? 'per_month') as OptionKey)}
            />

            <Input
              label="Первый платёж"
              labelView="outer"
              value={payDate ? dayjs(payDate).format('DD.MM.YYYY') : undefined}
              disabled={!perItem}
              block
              rightAddons={<CalendarMIcon color="#898991" />}
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                setOpenCalendar(true);
              }}
            />
          </>
        )}
      </div>
      <Gap size={96} />

      <div className={appSt.bottomBtn}>
        <div className={appSt.btmRow} onClick={handleOpenCalc}>
          <div>
            <Typography.Text view="primary-small" color="secondary" tag="p" defaultMargins={false}>
              Примерный доход через 15 лет
            </Typography.Text>
            <Typography.Text view="primary-medium" weight="medium">
              {sum ? total.toLocaleString('ru') : 'X'} ₽
            </Typography.Text>
          </div>
          <ChevronRightMIcon color="#898991" />
        </div>
        <ButtonMobile loading={loading} block view="primary" onClick={submit}>
          Продолжить
        </ButtonMobile>
      </div>

      <CalendarMobile
        value={payDate ? dayjs(payDate).toDate().getTime() : undefined}
        selectorView={'full'}
        yearsAmount={2}
        onClose={() => setOpenCalendar(false)}
        open={openCalendar}
        minDate={dayjs().toDate().getTime()}
        maxDate={dayjs().add(2, 'year').toDate().getTime()}
        onChange={date => setPayDate(dayjs(date).toDate().toISOString())}
      />

      <BottomSheet
        title={
          <Typography.Title tag="h2" view="small" font="system" weight="semibold">
            Калькулятор дохода за 15 лет
          </Typography.Title>
        }
        open={openCalc}
        onClose={handleCloseCalc}
        titleAlign="left"
        stickyHeader
        hasCloser
        contentClassName={appSt.btmContent}
        actionButton={
          <ButtonMobile block view="primary" onClick={handleCloseCalc}>
            Понятно
          </ButtonMobile>
        }
      >
        <div className={appSt.container}>
          <div>
            <Typography.Text view="primary-small" color="secondary" tag="p" defaultMargins={false}>
              Ежемесячный доход
            </Typography.Text>

            <Swiper spaceBetween={12} slidesPerView="auto" style={{ marginTop: '12px' }}>
              {chipsIncome.map(chip => (
                <SwiperSlide key={chip.value} className={appSt.swSlide}>
                  <Tag
                    view="filled"
                    size="xxs"
                    shape="rectangular"
                    checked={calcData.incomeValue === chip.value}
                    onClick={() => setCalcData({ ...calcData, incomeValue: chip.value })}
                  >
                    {chip.title}
                  </Tag>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <Input
            hint="От 2 000 ₽"
            type="number"
            label="Сумма первоначального взноса"
            labelView="outer"
            block
            placeholder="72 000 ₽"
            value={calcData.firstDeposit.toString()}
            onChange={e => setCalcData({ ...calcData, firstDeposit: Number(e.target.value) })}
            onBlur={handleBlurInputCalc1}
            pattern="[0-9]*"
          />
          <Input
            type="number"
            label="Сумма автоплатежа"
            labelView="outer"
            block
            placeholder="6000 ₽"
            value={calcData.monthlyDeposit.toString()}
            onChange={e => setCalcData({ ...calcData, monthlyDeposit: Number(e.target.value) })}
            onBlur={handleBlurInputCalc2}
            pattern="[0-9]*"
          />

          <Checkbox
            block={true}
            size={24}
            label="Инвестировать налоговый вычет в программу"
            checked={calcData.taxInvest}
            onChange={() => setCalcData({ ...calcData, taxInvest: !calcData.taxInvest })}
          />

          <div className={appSt.box}>
            <div style={{ marginBottom: '15px' }}>
              <Typography.TitleResponsive tag="h3" view="medium" font="system" weight="semibold">
                {total.toLocaleString('ru')} ₽
              </Typography.TitleResponsive>

              <Typography.Text view="primary-small" color="secondary">
                Накопите к 2040 году
              </Typography.Text>
            </div>

            <div className={appSt.btmRowCalc}>
              <Typography.Text view="secondary-large" color="secondary">
                Доход от инвестиций
              </Typography.Text>
              <Typography.Text view="primary-small">{investmentsIncome.toLocaleString('ru')} ₽</Typography.Text>
            </div>
            <div className={appSt.btmRowCalc}>
              <Typography.Text view="secondary-large" color="secondary">
                Государство добавит
              </Typography.Text>
              <Typography.Text view="primary-small">{govCharity.toLocaleString('ru')} ₽</Typography.Text>
            </div>
            {calcData.taxInvest && (
              <div className={appSt.btmRowCalc}>
                <Typography.Text view="secondary-large" color="secondary">
                  Налоговые вычеты добавят
                </Typography.Text>
                <Typography.Text view="primary-small">{taxRefund.toLocaleString('ru')} ₽</Typography.Text>
              </div>
            )}
            <div className={appSt.btmRowCalc}>
              <Typography.Text view="secondary-large" color="secondary">
                Взносы за 15 лет
              </Typography.Text>
              <Typography.Text view="primary-small">{deposit15years.toLocaleString('ru')} ₽</Typography.Text>
            </div>
          </div>
        </div>
      </BottomSheet>
    </>
  );
};
