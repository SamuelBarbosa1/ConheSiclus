import { getMenuCompleto } from './actions';
import HomeClient from './HomeClient';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Força o Vercel a usar Node em vez de Edge (onde o Prisma normal falha)

export default async function ConheceSiclusPage() {
  const categorias = await getMenuCompleto();

  return <HomeClient initialCategorias={categorias} />;
}