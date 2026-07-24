import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header
      className="text-white py-10"
      style={{
        background:
          "radial-gradient(circle at 90% 30%, var(--header-radial), transparent 45%), linear-gradient(90deg, var(--header-from) 0%, var(--header-via) 45%, var(--header-to) 100%)",
      }}
    >
      <div className="max-w-[1200px] mx-auto px-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-bold tracking-tight m-0 mb-2">
            AI Design Critic
          </h1>
          <p className="m-0 text-[15px] text-white/88 max-w-[640px]">
            Đánh giá mức độ tuân thủ thương hiệu và chất lượng thiết kế bằng StockMind AI
          </p>
        </div>
        <div className="flex-shrink-0 pt-1">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
