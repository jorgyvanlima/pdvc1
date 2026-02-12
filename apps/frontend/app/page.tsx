'use client';

import Link from 'next/link';
import { Package, ShoppingCart, BarChart3, DollarSign, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation */}
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-8 h-8" />
            <h1 className="text-2xl font-bold">PDVWeb C1</h1>
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="px-4 py-2 bg-white text-blue-600 rounded hover:bg-gray-100 font-semibold">
              Entrar
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Gestão Inteligente para seu Negócio
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
          PDVWeb C1 é um sistema moderno de PDV e ERP desenvolvido com as tecnologias mais atuais.
          <br />
          Rápido, seguro e fácil de usar.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Feature Cards */}
          {[
            {
              icon: ShoppingCart,
              title: 'PDV Inteligente',
              description: 'Venda rápida com suporte a múltiplas formas de pagamento',
            },
            {
              icon: Package,
              title: 'Estoque Controlado',
              description: 'Gerenciamento completo de inventário em tempo real',
            },
            {
              icon: BarChart3,
              title: 'Relatórios',
              description: 'Dashboards analíticos para análise de vendas e lucro',
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition"
            >
              <feature.icon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Link
          href="/login"
          className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition shadow-lg"
        >
          Comece Agora →
        </Link>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-100 dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8 text-center">
          {[
            { number: '1000+', label: 'Usuários' },
            { number: '50K+', label: 'Transações' },
            { number: '99.9%', label: 'Uptime' },
            { number: '24/7', label: 'Suporte' },
          ].map((stat, idx) => (
            <div key={idx}>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {stat.number}
              </div>
              <p className="text-gray-600 dark:text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">PDVWeb C1</h3>
              <p className="text-gray-400">
                Sistema moderno de PDV e ERP para pequenas e médias empresas
              </p>
            </div>
            {[
              {
                title: 'Produto',
                links: ['Recursos', 'Preços', 'Demo'],
              },
              {
                title: 'Empresa',
                links: ['Sobre', 'Blog', 'Carreiras'],
              },
              {
                title: 'Legal',
                links: ['Privacidade', 'Termos', 'Contato'],
              },
            ].map((col, idx) => (
              <div key={idx}>
                <h4 className="font-semibold mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link, i) => (
                    <li key={i}>
                      <a href="#" className="text-gray-400 hover:text-white transition">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>&copy; 2026 PDVWeb C1. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
