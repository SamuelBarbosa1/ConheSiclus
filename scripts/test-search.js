// Test search logic
const initialCategorias = [
  {
    id: '1',
    nome: 'Associados',
    submenus: [
      { id: '101', nome: 'Cadastro', conteudo: 'Como cadastrar', grupo: 'Docs' },
      { id: '102', nome: 'Carteira', conteudo: 'Como ver carteira', grupo: null }
    ]
  },
  {
    id: '2',
    nome: 'Financeiro',
    submenus: [
      { id: '201', nome: 'Boleto', conteudo: 'Segunda via', grupo: 'Pagamentos' }
    ]
  }
];

function filter(searchTerm) {
  const isSearching = searchTerm.trim().length > 0;
  const filtered = initialCategorias
    .map((cat) => {
      const term = searchTerm.toLowerCase();
      const filteredSubmenus = cat.submenus.filter((sub) => {
        return (
          sub.nome.toLowerCase().includes(term) ||
          (sub.conteudo && sub.conteudo.toLowerCase().includes(term)) ||
          (sub.grupo && sub.grupo.toLowerCase().includes(term))
        );
      });

      const catMatches = cat.nome.toLowerCase().includes(term);

      if (catMatches || filteredSubmenus.length > 0) {
        return { ...cat, submenus: filteredSubmenus };
      }
      return null;
    })
    .filter((cat) => cat !== null);
  return filtered;
}

console.log('Search "Carteira":', JSON.stringify(filter('Carteira'), null, 2));
console.log('Search "Financeiro":', JSON.stringify(filter('Financeiro'), null, 2));
console.log('Search "xyz":', JSON.stringify(filter('xyz'), null, 2));
console.log('Search "":', JSON.stringify(filter(''), null, 2));
