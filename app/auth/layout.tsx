import Image from 'next/image';

const AuthLayout: React.FC<Readonly<{ children: React.ReactNode }>> = ({ children }) => {
  return (
    <div className="grid min-h-screen grid-cols-1 overflow-x-hidden lg:grid-cols-2">
      <main className="flex flex-col justify-center bg-background px-4 py-24 md:px-12 lg:px-24">
        <div className="mx-auto w-full max-w-md">{children}</div>
      </main>

      <aside className="relative hidden bg-background lg:block">
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent" />
        <Image
          src="https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=2187&auto=format&fit=crop"
          alt="Rental equipment workspace"
          fill
          className="object-cover opacity-80"
          priority
          sizes="50vw"
        />
        <div className="absolute inset-0 z-10 bg-gradient-to-l from-transparent via-background/50 to-background" />
      </aside>
    </div>
  );
};

export default AuthLayout;
