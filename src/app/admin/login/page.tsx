'use client';

import React, { useState } from 'react';
import { login } from '../../actions';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('senha', senha);

    try {
      const result = await login(formData);
      if (result.success) {
        router.push('/admin');
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Falha ao realizar login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#f8fbff]" style={{
      backgroundImage: `radial-gradient(circle at 2px 2px, #e2e8f0 1px, transparent 0)`,
      backgroundSize: '32px 32px'
    }}>
      <div className="w-full max-w-[480px] animate-in fade-in zoom-in duration-500">
        <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden">
          {/* Header/Logo */}
          <div className="pt-12 pb-8 px-8 text-center flex flex-col items-center">
            <div className="bg-gray-50 p-4 rounded-2xl mb-6 shadow-inner">
               <img 
                src="/ensti-logo.jpg" 
                alt="ENSTI/Siclus" 
                className="h-16 w-auto object-contain"
              />
            </div>
            
            <h1 className="text-2xl font-black text-[#0f2c4a] tracking-tight">
              Acesso Restrito
            </h1>
            <p className="text-gray-400 text-sm mt-1 font-medium">
              Gestão da Base de Conhecimento
            </p>
          </div>

          <div className="px-8 pb-12">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold rounded animate-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-mail Corporativo</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input
                    type="email"
                    placeholder="exemplo@ensti.com.br"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-all text-gray-900 font-medium placeholder:text-gray-300"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Chave de Acesso</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    required
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-400 focus:bg-white transition-all text-gray-900 font-mono tracking-widest placeholder:text-gray-300"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-[#0f2c4a] hover:bg-[#1a4a7a] text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-blue-900/10 flex items-center justify-center gap-2 group disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Entrar no Painel
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="bg-gray-50/50 py-4 px-8 border-t border-gray-100/50 flex justify-center">
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
              Siclus Intelligence • Security Layer active
            </span>
          </div>
        </div>
        
        <div className="mt-8 text-center text-gray-400 text-[10px] font-bold opacity-60">
          COPYRIGHT © ENSTI - {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}

