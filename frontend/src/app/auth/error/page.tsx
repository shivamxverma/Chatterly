import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AuthError({ searchParams }: PageProps) {
  const { message } = await searchParams;
  const text = Array.isArray(message) ? message[0] : message ?? "";

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-6">
      <Image
        src="/images/error.svg"
        width={500}
        height={500}
        alt="Authentication error illustration"
        priority
      />
      <p className="text-xl text-red-600">{text}</p>
      <Link href="/" prefetch={false}>
        <Button>Back to home</Button>
      </Link>
    </div>
  );
}
