import { Link } from "react-router-dom";
import { WaveBand, LotusMark } from "../../assets/motifs/Motifs.jsx";
import { PATHS } from "../../routes/paths";
import Logo from "../../assets/Logo.png";

const FOOTER_LINKS = [
  { label: "Cộng đồng", to: PATHS.community },
  { label: "Đối tác", to: PATHS.partners },
  { label: "Tư vấn bản mệnh", to: PATHS.koiCompatible },
  { label: "Kinh nghiệm hay", to: PATHS.blog },
];

const FooterComponent = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-pond text-[#E6D9A8]">
      <WaveBand height={36} opacity={0.3} className="block w-full" />
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <Link to="/" aria-label="Koi FengShui — Về trang chủ" className="inline-flex items-center">
            <img src={Logo} alt="" loading="lazy" className="h-12 w-auto" />
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#E6D9A8]/90">
            Cân bằng phong thủy, Koi vượng tài lộc.
          </p>
          <LotusMark size={28} className="mt-4 text-gold" />
        </div>

        <nav aria-label="Liên kết chân trang">
          <h3 className="font-display text-base font-semibold text-[#FDF6EC]">
            Khám phá
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {FOOTER_LINKS.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  className="transition-colors duration-fast hover:text-gold-soft"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="font-display text-base font-semibold text-[#FDF6EC]">
            Liên hệ
          </h3>
          <p className="mt-4 text-sm leading-relaxed">
            Hộp thư hỗ trợ:{" "}
            <a
              href="mailto:support@koifengshui.vn"
              className="transition-colors duration-fast hover:text-gold-soft"
            >
              support@koifengshui.vn
            </a>
          </p>
          <p className="mt-6 text-xs text-[#E6D9A8]/70">© {year} Koi FengShui</p>
        </div>
      </div>
    </footer>
  );
};

export default FooterComponent;
