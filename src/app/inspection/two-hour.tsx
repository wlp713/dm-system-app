import { t } from '../../domain/i18n';
import { twoHourSlot } from '../../domain/model';
import { useDm } from '../../state/DmProvider';
import { Eyebrow, Screen, Title } from '../../ui/components';
import { CheckForm } from '../../ui/CheckForm';

export default function TwoHourScreen() {
  const { settings } = useDm();
  const l = settings.language;
  return <Screen><Eyebrow>{settings.workshop} / {t(l, 'currentSlot')} {twoHourSlot().label}</Eyebrow><Title subtitle={t(l, 'twoHourIntro')}>{t(l, 'twoHour')}</Title><CheckForm type="twoHour" /></Screen>;
}
