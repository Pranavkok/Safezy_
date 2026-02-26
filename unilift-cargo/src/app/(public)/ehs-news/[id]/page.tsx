import { getEhsNewsById } from '@/actions/admin/ehs/news';
import { fetchEhsNewsMetadataById } from '@/actions/metadata';
import EhsNewsDetails from '@/sections/ehs/ehs-news/EhsDetailsSection';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import React from 'react';

export async function generateMetadata({
  params
}: {
  params: { id: number };
}): Promise<Metadata> {
  return await fetchEhsNewsMetadataById(params.id);
}
const EhsNewsDetailsPage = async ({
  params
}: {
  params: {
    id: number;
  };
}) => {
  const ehsNewsId = params.id;

  const res = await getEhsNewsById(ehsNewsId);

  if (!res.success || !res.data) {
    notFound();
  }
  return <EhsNewsDetails news={res.data} />;
};

export default EhsNewsDetailsPage;
