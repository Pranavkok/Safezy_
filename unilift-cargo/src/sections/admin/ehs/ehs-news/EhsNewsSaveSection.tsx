import EhsAddUpdateSection from '../../ehs/ehs-news/EhsAddUpdateSection';
import { getEhsNewsById } from '@/actions/admin/ehs/news';
import { notFound } from 'next/navigation';

const EhsNewsSaveSection = async ({ ehsNewsId }: { ehsNewsId: number }) => {
  const { data: ehsNews } = await getEhsNewsById(ehsNewsId);

  if (!ehsNews) {
    notFound();
  }

  return <EhsAddUpdateSection ehsNews={ehsNews} />;
};

export default EhsNewsSaveSection;
