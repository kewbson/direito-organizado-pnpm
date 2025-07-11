import { doc, setDoc, collection } from "firebase/firestore";

export const seedNewUser = async (db, userId) => {
  console.log(`Seeding initial data for new user: ${userId}`);

  // Caderno Digital
  const notebookRef = doc(collection(db, `users/${userId}/caderno`));
  await setDoc(notebookRef, {
    title: "Boas-vindas ao Caderno!",
    text: "Uma anotação simples explicando que o caderno é seu espaço pessoal para escrever resumos, insights, dúvidas e esquemas de estudo. Você pode adicionar quantas anotações quiser. Clique no botão + para criar a sua!",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Planejamento de Estudos
  const planningRef = doc(collection(db, `users/${userId}/planejamento`));
  await setDoc(planningRef, {
    title: "Meu Primeiro Cronograma",
    description: "Um plano de exemplo contendo três matérias e datas sugeridas. Aqui você pode montar seus próprios cronogramas. Este é só um modelo para te inspirar!",
    subjects: [
      { name: "Direito Constitucional", dueDate: "2025-07-15" },
      { name: "Direito Civil", dueDate: "2025-07-22" },
      { name: "Direito Penal", dueDate: "2025-07-29" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Testes Rápidos (Quiz exemplo)
  const quizRef = doc(collection(db, `users/${userId}/resultados`));
  await setDoc(quizRef, {
    quizTitle: "Mini Simulado de Direito Constitucional",
    questions: [
      {
        id: 1,
        pergunta: "Qual é o princípio fundamental da República Federativa do Brasil que garante a participação popular?",
        opcoes: ["Soberania", "Cidadania", "Dignidade da pessoa humana", "Valores sociais do trabalho e da livre iniciativa"],
        resposta_correta: 1,
        explicacao: "A cidadania é um dos fundamentos da República Federativa do Brasil, conforme o Art. 1º, II, da Constituição Federal, e garante a participação do povo na vida política do Estado.",
      },
      {
        id: 2,
        pergunta: "A Constituição Federal de 1988 é classificada como:",
        opcoes: ["Outorgada e sintética", "Promulgada e analítica", "Cesarista e dogmática", "Dualista e rígida"],
        resposta_correta: 1,
        explicacao: "A Constituição Federal de 1988 é promulgada (fruto de um processo democrático) e analítica (detalhada em seu conteúdo).",
      },
      {
        id: 3,
        pergunta: "O que são direitos fundamentais de primeira dimensão?",
        opcoes: ["Direitos sociais, econômicos e culturais", "Direitos de liberdade e civis", "Direitos de fraternidade e solidariedade", "Direitos difusos e coletivos"],
        resposta_correta: 1,
        explicacao: "Os direitos fundamentais de primeira dimensão são os direitos de liberdade e civis, que surgiram com o liberalismo e visam limitar a atuação do Estado.",
      },
    ],
    message: "Agora é sua vez! Em breve, você poderá criar seus próprios simulados.",
    createdAt: new Date().toISOString(),
  });

  console.log(`Initial data seeded successfully for user: ${userId}`);
};

