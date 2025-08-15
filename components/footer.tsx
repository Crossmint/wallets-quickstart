import Image from "next/image";

export function Footer() {
  return (
    <footer className="flex flex-col gap-4 items-center justify-center py-8 mt-auto">
      <div className="flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://github.com/Crossmint/wallets-quickstart"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          View code
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://www.crossmint.com/quickstarts"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          See all quickstarts
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://crossmint.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to crossmint.com →
        </a>
      </div>
      <div className="flex">
        <Image
          src="/crossmint-leaf.svg"
          alt="Powered by Crossmint"
          priority
          width={152}
          height={100}
        />
      </div>
    </footer>
  );
}
