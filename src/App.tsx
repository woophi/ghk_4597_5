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

const min = 2000;
const max = 3_000_000;

const chips = [2000, 5000, 15000, 25000];
const chipsIncome = ['До 80 000 ₽', '80 001 ₽ – 150 000 ₽', '150 001 ₽ и более'];

const addSome = 36_000;
const sduiLink =
  'alfabank://sdui_screen?screenName=InvestmentLongread&fromCurrent=true&endpoint=v1/invest-main-screen-view/investment-longread/45034%3flocation=AM%26campaignCode=GH';

type OptionKey = 'per_month' | 'per_week' | 'per_quarter' | 'per_annual';

const OPTIONS = [
  { key: 'per_month', content: 'Раз в месяц' },
  { key: 'per_week', content: 'Раз в неделю' },
  { key: 'per_quarter', content: 'Раз в квартал' },
  { key: 'per_annual', content: 'Раз в год' },
];

export const App = () => {
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState('');
  const [errorAutoSum, setErrorAutomSum] = useState('');
  const [sum, setSum] = useState('');
  const [autoSum, setAutoSum] = useState('');
  const [perItem, setPerItem] = useState<OptionKey>('per_month');
  const [thxShow, setThx] = useState(LS.getItem(LSKeys.ShowThx, false));
  const [openCalendar, setOpenCalendar] = useState(false);
  const [openCalc, setOpenCalc] = useState(false);
  const [payDate, setPayDate] = useState(dayjs().add(1, 'month').toDate().toISOString());

  useEffect(() => {
    setAutoSum(sum);
  }, [sum]);

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
    if (!autoSum) {
      setErrorAutomSum('Введите сумму автоплатежа');
      return;
    }

    setLoading(true);
    // LS.setItem(LSKeys.ShowThx, true);
    setThx(true);
    setLoading(false);
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

  const goToSdui = () => {
    window.location.replace(sduiLink);
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
          hint="От 2000 до 3 000 000 ₽"
          type="number"
          min={min}
          max={max}
          label="Сумма взноса"
          error={error}
          value={sum}
          onChange={handleChangeInput}
          onBlur={handleBlurInput}
          block
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

        <Switch
          block
          reversed
          checked={checked}
          label="Пополнять регулярно"
          onChange={() => setChecked(prevState => !prevState)}
        />

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
        <div className={appSt.btmRow} onClick={() => setOpenCalc(true)}>
          <div>
            <Typography.Text view="primary-small" color="secondary" tag="p" defaultMargins={false}>
              Примерный доход через 15 лет
            </Typography.Text>
            <Typography.Text view="primary-medium" weight="medium">
              X ₽
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
        onClose={() => setOpenCalc(false)}
        titleAlign="left"
        stickyHeader
        hasCloser
        contentClassName={appSt.btmContent}
        actionButton={
          <ButtonMobile block view="primary" onClick={() => setOpenCalc(false)}>
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
                <SwiperSlide key={chip} className={appSt.swSlide}>
                  <Tag view="filled" size="xxs" shape="rectangular">
                    {chip}
                  </Tag>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <Input
            hint="От 2000 ₽"
            type="number"
            label="Первоначальный взнос"
            labelView="outer"
            block
            placeholder="72 000 ₽"
          />
          <Input type="number" label="Взносы в месяц" labelView="outer" block placeholder="6000 ₽" />

          <Checkbox block={true} size={24} label="Инвестировать налоговый вычет в программу " />

          <div className={appSt.box}>
            <div style={{ marginBottom: '15px' }}>
              <Typography.TitleResponsive tag="h3" view="medium" font="system" weight="semibold">
                3 640 123 ₽
              </Typography.TitleResponsive>

              <Typography.Text view="primary-small" color="secondary">
                Накопите к 2040 году
              </Typography.Text>
            </div>

            <div className={appSt.btmRowCalc}>
              <Typography.Text view="secondary-large" color="secondary">
                Доход от инвестиций
              </Typography.Text>
              <Typography.Text view="primary-small">2 003 083 ₽</Typography.Text>
            </div>
            <div className={appSt.btmRowCalc}>
              <Typography.Text view="secondary-large" color="secondary">
                Государство добавит
              </Typography.Text>
              <Typography.Text view="primary-small">360 000 ₽</Typography.Text>
            </div>
            <div className={appSt.btmRowCalc}>
              <Typography.Text view="secondary-large" color="secondary">
                Налоговые вычеты добавят
              </Typography.Text>
              <Typography.Text view="primary-small">140 400 ₽</Typography.Text>
            </div>
            <div className={appSt.btmRowCalc}>
              <Typography.Text view="secondary-large" color="secondary">
                Взносы за 15 лет
              </Typography.Text>
              <Typography.Text view="primary-small">1 146 000 ₽</Typography.Text>
            </div>
          </div>
        </div>
      </BottomSheet>
    </>
  );
};
