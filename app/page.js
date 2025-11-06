import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <h2>Welcome to the Online Learning Platform</h2>
      <Button>Hellow world</Button>
      <UserButton />
    </div>
  );
}
