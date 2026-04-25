type FooterPlaceholderPageProps = {
  title: string;
};

export function FooterPlaceholderPage({ title }: FooterPlaceholderPageProps) {
  return (
    <section className='flex min-h-screen bg-white pt-32 pb-24 text-slate-900 dark:bg-slate-950 dark:text-slate-100'>
      <div className='mx-auto flex w-full max-w-7xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8'>
        <p className='text-sm font-semibold text-blue-600 dark:text-blue-300'>{title}</p>
        <h1 className='mt-4 text-4xl font-bold tracking-normal'>开发中</h1>
        <p className='mt-4 max-w-xl text-sm leading-7 text-slate-500 dark:text-slate-400'>
          当前板块正在建设中，完整内容将陆续上线。
        </p>
      </div>
    </section>
  );
}
