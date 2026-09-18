const modules = [
  ["Contacts", "Centralize numbers, contacts and tags."],
  ["Accounts", "Manage external accounts and associations."],
  ["Finance", "Track revenue, expenses and results."],
  ["Team", "Control users, roles and permissions."],
  ["Synchronization", "Connect external data providers safely."],
  ["History", "Keep a complete operational audit trail."],
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <div className="mb-10 max-w-3xl">
          <div className="mb-4 inline-flex rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow-sm">
            VICOS
          </div>
          <h1 className="text-5xl font-bold tracking-tight md:text-7xl">
            Your Business <span className="text-blue-500">Operating System.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Um único sistema para contatos, contas, finanças, equipe, sincronização e histórico da sua empresa.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map(([title, description]) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
            </article>
          ))}
        </div>

        <p className="mt-10 text-sm font-medium text-slate-400">One company. One system. VICOS.</p>
      </section>
    </main>
  );
}
