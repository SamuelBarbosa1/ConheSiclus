import { getCategorias, getSubmenus, checkAuth } from '../actions';
import AdminClient from './AdminClient';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: "ConheSiclusAdmin",
};

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function AdminPage() {
  const session = await checkAuth();
  if (!session) {
    redirect('/admin/login');
  }

  const categorias = await getCategorias();
  const submenus = await getSubmenus(); // Buscar todos os submenus inicialmente

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-800">Painel Administrador</h1>
        <AdminClient initialCategorias={categorias} initialSubmenus={submenus} />
      </div>
    </div>
  );
}
