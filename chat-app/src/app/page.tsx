import { DemoAiAssistatBasic } from "@/components/demo";

export default function Home() {
  return (
    <div 
      className="flex flex-col flex-1 items-center justify-center font-sans min-h-screen"
      style={{
        background: `
          radial-gradient(circle at 20% 90%, #4B17E2 0%, transparent 35%),
          radial-gradient(circle at 80% 20%, #4324A1 0%, transparent 40%),
          linear-gradient(
            180deg,
            #120635 0%,
            #210A64 45%,
            #30108F 100%
          )
        `
      }}
    >
      <main className="flex flex-1 w-full flex-col items-center justify-center p-8">
        <DemoAiAssistatBasic />
      </main>
    </div>
  );
}
