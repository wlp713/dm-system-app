import { useLocalSearchParams } from 'expo-router';
import { categoryName, t } from '../../domain/i18n';
import { Category, CATEGORIES } from '../../domain/model';
import { useDm } from '../../state/DmProvider';
import { Eyebrow, Screen, Title } from '../../ui/components';
import { CheckForm } from '../../ui/CheckForm';

export function generateStaticParams() { return CATEGORIES.map(category => ({ category })); }

export default function CategoryCheckScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  const { settings } = useDm();
  if (!CATEGORIES.includes(category as Category)) return null;
  const selected = category as Category;
  const l = settings.language;
  return <Screen><Eyebrow>4M / {settings.workshop}</Eyebrow><Title subtitle={t(l, `${selected}Hint`)}>{categoryName(l, selected, true)} · {t(l, 'detail')}</Title><CheckForm type="4m" category={selected} /></Screen>;
}
