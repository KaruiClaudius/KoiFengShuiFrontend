import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  assessCompatibility,
  getFengShuiConsultation,
} from "../../api/compatibility";
import {
  Badge,
  Button,
  Card,
  Dialog,
  DialogContent,
  EmptyState,
  Input,
  notify,
  Skeleton,
  Tab,
  Tabs,
  TabsContent,
  TabsList,
} from "../../ui";
import { CloudDivider, SealStamp, WaveBand } from "../../assets/motifs/Motifs";
import { shareResultCard } from "../../utils/shareResult";

const DIRECTIONS = [
  "Đông",
  "Tây",
  "Nam",
  "Bắc",
  "Đông Nam",
  "Tây Nam",
  "Đông Bắc",
  "Tây Bắc",
];

const POND_SHAPES = [
  "Tròn",
  "Nghiên mực",
  "Bán nguyệt",
  "Chữ nhật",
  "Vuông",
  "Các góc nhọn",
];

const KOI_COLORS = ["Trắng", "Đỏ", "Vàng", "Đen", "Cam", "Nâu"];

const ELEMENT_KEY_BY_NAME = {
  Kim: "kim",
  Mộc: "moc",
  Thuỷ: "thuy",
  Hoả: "hoa",
  Thổ: "tho",
};

const EMPTY_COMPAT_VALUES = {
  birthYear: "",
  isMale: "",
  koiColors: [],
  koiNumber: "",
  pondDirection: "",
  pondShape: "",
};

const selectClass = (hasError) =>
  `w-full rounded-md bg-surface border px-3.5 py-2.5 outline-none transition-shadow duration-fast focus:shadow-gold ${
    hasError ? "border-crimson" : "border-gold/40 focus:border-gold"
  }`;

const positiveIntegerError = (value) =>
  value && (!Number.isInteger(Number(value)) || Number(value) <= 0)
    ? "Vui lòng nhập số nguyên không âm và lớn hơn 0"
    : "";

const validateCompatibility = (values) => ({
  birthYear: !values.birthYear
    ? "Vui lòng nhập năm sinh"
    : positiveIntegerError(values.birthYear),
  isMale: values.isMale === "" ? "Vui lòng chọn giới tính" : "",
  koiColors:
    values.koiColors.length === 0 ? "Vui lòng chọn màu cá koi" : "",
  koiNumber: !values.koiNumber
    ? "Vui lòng nhập số lượng"
    : positiveIntegerError(values.koiNumber),
  pondDirection: values.pondDirection ? "" : "Vui lòng chọn hướng đặt hồ",
  pondShape: values.pondShape ? "" : "Vui lòng chọn hình dạng hồ",
});

const hasErrors = (errors) => Object.values(errors).some(Boolean);

const FieldLabel = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="text-sm font-semibold text-ink">
    {children}
  </label>
);

FieldLabel.propTypes = {
  htmlFor: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

const FieldError = ({ message }) =>
  message ? <p className="text-xs text-crimson">{message}</p> : null;

FieldError.propTypes = {
  message: PropTypes.string,
};

const CheckIcon = () => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="mt-0.5 h-4 w-4 shrink-0 text-jade"
    aria-hidden="true"
  >
    <path d="M4 10.5l4 4 8-9" />
  </svg>
);

const CrossIcon = () => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    className="mt-0.5 h-4 w-4 shrink-0 text-crimson"
    aria-hidden="true"
  >
    <path d="M6 6l8 8M14 6l-8 8" />
  </svg>
);

const ShareIcon = () => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 shrink-0"
    aria-hidden="true"
  >
    <path d="M10 12.5V3M6.5 6L10 2.5L13.5 6" />
    <path d="M4 10.5V16a1 1 0 001 1h10a1 1 0 001-1v-5.5" />
  </svg>
);

const HighlightedText = ({ text }) => {
  const parts = text.split(/(\([^)]+\))/);
  return (
    <span>
      {parts.map((part, index) =>
        part.startsWith("(") && part.endsWith(")") ? (
          <strong key={index} className="font-semibold text-jade">
            {part}
          </strong>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        )
      )}
    </span>
  );
};

HighlightedText.propTypes = {
  text: PropTypes.string.isRequired,
};

const InfoRow = ({ label, children }) => (
  <div className="flex items-start justify-between gap-4 border-b border-gold/25 py-3">
    <dt className="shrink-0 text-muted">{label}</dt>
    <dd className="text-right font-medium text-ink">{children}</dd>
  </div>
);

InfoRow.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node,
};

const ElementBadge = ({ name }) => {
  const key = ELEMENT_KEY_BY_NAME[name];
  if (key) {
    return <Badge element={key}>{name}</Badge>;
  }
  return <span className="font-medium text-ink">{name}</span>;
};

ElementBadge.propTypes = {
  name: PropTypes.string.isRequired,
};

const BulletList = ({ heading, items, nameKey, tone }) => {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <div className="mt-6">
      <h4 className="font-display text-lg text-ink">{heading}</h4>
      <ul className="mt-3 space-y-2.5">
        {items.map((item, index) => (
          <li
            key={`${item[nameKey]}-${index}`}
            className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-soft"
          >
            {tone === "danger" ? <CrossIcon /> : <CheckIcon />}
            <span>
              <strong
                className={
                  tone === "danger"
                    ? "font-semibold text-crimson"
                    : "font-semibold text-ink"
                }
              >
                {item[nameKey]}:{" "}
              </strong>
              {item.description}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

BulletList.propTypes = {
  heading: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      description: PropTypes.string,
    })
  ),
  nameKey: PropTypes.string.isRequired,
  tone: PropTypes.oneOf(["jade", "danger"]),
};

const CompatibilityResult = ({ data }) => (
  <div>
    <div className="rounded-md bg-paper-2 px-6 py-5 text-center">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted">
        Tổng điểm phù hợp
      </p>
      <p className="mt-1 font-display text-4xl text-jade">
        {data.overallCompatibilityScore.toFixed(2)}%
      </p>
    </div>
    <dl className="mt-4 text-sm">
      <InfoRow label="Điểm hướng">
        {data.directionScore.toFixed(2)}%
      </InfoRow>
      <InfoRow label="Điểm hình dạng">
        {data.shapeScore.toFixed(2)}%
      </InfoRow>
      <InfoRow label="Điểm số lượng">
        {data.quantityScore.toFixed(2)}%
      </InfoRow>
      <InfoRow label="Điểm màu sắc tổng">
        {data.colorScores.TotalScore.toFixed(2)}%
      </InfoRow>
    </dl>
    <h4 className="mt-6 font-display text-lg text-ink">
      Chi tiết điểm màu sắc
    </h4>
    <dl className="mt-1 text-sm">
      {Object.entries(data.colorScores)
        .filter(([color]) => color !== "TotalScore")
        .map(([color, score]) => (
          <InfoRow key={color} label={color}>
            {score.toFixed(2)}%
          </InfoRow>
        ))}
    </dl>
    {Array.isArray(data.recommendations) && data.recommendations.length > 0 && (
      <div className="mt-6">
        <h4 className="font-display text-lg text-ink">Đề xuất cải thiện</h4>
        <ul className="mt-3 space-y-2.5">
          {data.recommendations.map((recommendation, index) => (
            <li
              key={index}
              className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-soft"
            >
              <CheckIcon />
              <span>
                <HighlightedText text={recommendation} />
              </span>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

CompatibilityResult.propTypes = {
  data: PropTypes.shape({
    overallCompatibilityScore: PropTypes.number.isRequired,
    directionScore: PropTypes.number.isRequired,
    shapeScore: PropTypes.number.isRequired,
    quantityScore: PropTypes.number.isRequired,
    colorScores: PropTypes.object.isRequired,
    recommendations: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
};

const ElementResult = ({ data }) => (
  <div>
    <h3 className="text-center font-display text-2xl text-ink">
      Kết quả tư vấn bản mệnh
    </h3>
    <dl className="mt-5 text-sm">
      <InfoRow label="Ngũ hành">
        <ElementBadge name={data.element} />
      </InfoRow>
      <InfoRow label="Cung">{data.cung}</InfoRow>
      <InfoRow label="Con số may mắn">
        {(data.luckyNumbers || []).join(", ")}
      </InfoRow>
      <InfoRow label="Giống cá phù hợp">
        {(data.fishBreeds || []).join(", ")}
      </InfoRow>
      <InfoRow label="Màu cá phù hợp">
        {(data.fishColors || []).join(", ")}
      </InfoRow>
    </dl>
    <BulletList
      heading="Hình dạng hồ phù hợp"
      items={(data.suggestedPonds || []).filter((pond) => pond.isRecommended)}
      nameKey="shapeName"
    />
    <BulletList
      heading="Hình dạng hồ không phù hợp"
      items={(data.suggestedPonds || []).filter((pond) => !pond.isRecommended)}
      nameKey="shapeName"
      tone="danger"
    />
    <BulletList
      heading="Hướng hồ phù hợp"
      items={data.suggestedDirections}
      nameKey="directionName"
    />
  </div>
);

ElementResult.propTypes = {
  data: PropTypes.shape({
    element: PropTypes.string.isRequired,
    cung: PropTypes.string.isRequired,
    luckyNumbers: PropTypes.array,
    fishBreeds: PropTypes.array,
    fishColors: PropTypes.array,
    suggestedPonds: PropTypes.array,
    suggestedDirections: PropTypes.array,
  }).isRequired,
};

const ResultSkeleton = () => (
  <div
    role="status"
    aria-label="Đang tải"
    className="mt-8 space-y-4 border-t border-gold/25 pt-8"
  >
    <Skeleton className="mx-auto h-16 w-44 rounded-md" />
    {[0, 1, 2, 3].map((row) => (
      <Skeleton key={row} className="h-10 w-full rounded-md" />
    ))}
  </div>
);

const CompatibilityFields = ({ idPrefix, values, errors, onChange }) => (
  <div className="space-y-5">
    <div>
      <FieldLabel htmlFor={`${idPrefix}-birthYear`}>Năm sinh</FieldLabel>
      <Input
        id={`${idPrefix}-birthYear`}
        name="birthYear"
        type="number"
        min="1"
        step="1"
        placeholder="2003"
        value={values.birthYear}
        onChange={(event) => onChange("birthYear", event.target.value)}
        error={errors.birthYear}
        className="mt-2"
      />
    </div>

    <div className="flex flex-col gap-1.5">
      <FieldLabel htmlFor={`${idPrefix}-isMale`}>Giới tính</FieldLabel>
      <select
        id={`${idPrefix}-isMale`}
        name="isMale"
        value={values.isMale}
        onChange={(event) => onChange("isMale", event.target.value)}
        aria-invalid={!!errors.isMale}
        className={selectClass(!!errors.isMale)}
      >
        <option value="">Chọn giới tính</option>
        <option value="true">Nam</option>
        <option value="false">Nữ</option>
      </select>
      <FieldError message={errors.isMale} />
    </div>

    <fieldset>
      <legend className="text-sm font-semibold text-ink">
        Màu sắc cá koi đang có
      </legend>
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2.5">
        {KOI_COLORS.map((color) => (
          <label
            key={color}
            className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink-soft"
          >
            <input
              type="checkbox"
              value={color}
              checked={values.koiColors.includes(color)}
              onChange={() =>
                onChange(
                  "koiColors",
                  values.koiColors.includes(color)
                    ? values.koiColors.filter((item) => item !== color)
                    : [...values.koiColors, color]
                )
              }
              className="h-4 w-4 accent-[#A92C2C]"
            />
            {color}
          </label>
        ))}
      </div>
      <div className="mt-1.5">
        <FieldError message={errors.koiColors} />
      </div>
    </fieldset>

    <div>
      <FieldLabel htmlFor={`${idPrefix}-koiNumber`}>Số lượng cá Koi</FieldLabel>
      <Input
        id={`${idPrefix}-koiNumber`}
        name="koiNumber"
        type="number"
        min="1"
        step="1"
        placeholder="1"
        value={values.koiNumber}
        onChange={(event) => onChange("koiNumber", event.target.value)}
        error={errors.koiNumber}
        className="mt-2"
      />
    </div>

    <div className="flex flex-col gap-1.5">
      <FieldLabel htmlFor={`${idPrefix}-pondDirection`}>
        Hướng đặt hồ
      </FieldLabel>
      <select
        id={`${idPrefix}-pondDirection`}
        name="pondDirection"
        value={values.pondDirection}
        onChange={(event) => onChange("pondDirection", event.target.value)}
        aria-invalid={!!errors.pondDirection}
        className={selectClass(!!errors.pondDirection)}
      >
        <option value="">Chọn hướng đặt hồ</option>
        {DIRECTIONS.map((direction) => (
          <option key={direction} value={direction}>
            {direction}
          </option>
        ))}
      </select>
      <FieldError message={errors.pondDirection} />
    </div>

    <div className="flex flex-col gap-1.5">
      <FieldLabel htmlFor={`${idPrefix}-pondShape`}>Hình dạng hồ</FieldLabel>
      <select
        id={`${idPrefix}-pondShape`}
        name="pondShape"
        value={values.pondShape}
        onChange={(event) => onChange("pondShape", event.target.value)}
        aria-invalid={!!errors.pondShape}
        className={selectClass(!!errors.pondShape)}
      >
        <option value="">Chọn hình dạng hồ</option>
        {POND_SHAPES.map((shape) => (
          <option key={shape} value={shape}>
            {shape}
          </option>
        ))}
      </select>
      <FieldError message={errors.pondShape} />
    </div>
  </div>
);

CompatibilityFields.propTypes = {
  idPrefix: PropTypes.string.isRequired,
  values: PropTypes.shape({
    birthYear: PropTypes.string.isRequired,
    isMale: PropTypes.string.isRequired,
    koiColors: PropTypes.arrayOf(PropTypes.string).isRequired,
    koiNumber: PropTypes.string.isRequired,
    pondDirection: PropTypes.string.isRequired,
    pondShape: PropTypes.string.isRequired,
  }).isRequired,
  errors: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

const KoiCompatibilityForm = () => {
  const [formType, setFormType] = useState("element");
  const [elementValues, setElementValues] = useState({
    birthYear: "",
    isMale: "",
  });
  const [elementErrors, setElementErrors] = useState({});
  const [compatValues, setCompatValues] = useState(EMPTY_COMPAT_VALUES);
  const [compatErrors, setCompatErrors] = useState({});
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [lastRequest, setLastRequest] = useState(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareValues, setCompareValues] = useState(EMPTY_COMPAT_VALUES);
  const [compareErrors, setCompareErrors] = useState({});
  const [compareLoading, setCompareLoading] = useState(false);
  const [comparisonResults, setComparisonResults] = useState(null);

  useEffect(() => {
    setResults(null);
    setError(false);
  }, [formType]);

  const handleTabChange = (value) => {
    setFormType(value);
  };

  const handleCompatibilityChange = (name, value) => {
    setCompatValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCompareChange = (name, value) => {
    setCompareValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleError = (err) => {
    console.error("Error:", err);
    setError(true);
    notify.error("Đã xảy ra lỗi khi xử lý yêu cầu của bạn.");
  };

  const submitCompatibility = async (values) => {
    setLoading(true);
    setError(null);
    setLastRequest({ type: "compatibility", values });
    try {
      const response = await assessCompatibility({
        dateOfBirth: parseInt(values.birthYear),
        isMale: values.isMale,
        direction: values.pondDirection,
        pondShape: values.pondShape,
        fishColors: values.koiColors,
        fishQuantity: parseInt(values.koiNumber),
      });
      setResults(response.data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const submitElement = async (values) => {
    setLoading(true);
    setError(null);
    setLastRequest({ type: "element", values });
    try {
      const response = await getFengShuiConsultation({
        yearOfBirth: parseInt(values.birthYear),
        isMale: values.isMale,
      });
      setResults(response.data);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleElementSubmit = (event) => {
    event.preventDefault();
    const errors = {
      birthYear: !elementValues.birthYear
        ? "Vui lòng nhập năm sinh"
        : positiveIntegerError(elementValues.birthYear),
      isMale: elementValues.isMale === "" ? "Vui lòng chọn giới tính" : "",
    };
    setElementErrors(errors);
    if (hasErrors(errors)) return;
    submitElement({
      ...elementValues,
      isMale: elementValues.isMale === "true",
    });
  };

  const handleCompatibilitySubmit = (event) => {
    event.preventDefault();
    const errors = validateCompatibility(compatValues);
    setCompatErrors(errors);
    if (hasErrors(errors)) return;
    submitCompatibility({
      ...compatValues,
      isMale: compatValues.isMale === "true",
    });
  };

  const handleRetry = () => {
    if (!lastRequest) return;
    if (lastRequest.type === "compatibility") {
      submitCompatibility(lastRequest.values);
    } else {
      submitElement(lastRequest.values);
    }
  };

  const buildSharePayload = () => {
    if (!results) return null;
    if (formType === "element") {
      return {
        title: "Kết quả tư vấn bản mệnh",
        lines: [
          results.element ? `Ngũ hành: ${results.element}` : null,
          results.cung ? `Cung: ${results.cung}` : null,
          (results.luckyNumbers || []).length > 0
            ? `Con số may mắn: ${results.luckyNumbers.join(", ")}`
            : null,
          (results.fishBreeds || []).length > 0
            ? `Giống cá phù hợp: ${results.fishBreeds.join(", ")}`
            : null,
          (results.fishColors || []).length > 0
            ? `Màu cá phù hợp: ${results.fishColors.join(", ")}`
            : null,
        ].filter(Boolean),
      };
    }
    const recommendation = (Array.isArray(results.recommendations)
      ? results.recommendations
      : []
    ).find((item) => typeof item === "string" && item.trim());
    return {
      title: `Tổng điểm phù hợp: ${results.overallCompatibilityScore.toFixed(2)}%`,
      lines: [
        `Điểm hướng: ${results.directionScore.toFixed(2)}%`,
        `Điểm hình dạng: ${results.shapeScore.toFixed(2)}%`,
        `Điểm số lượng: ${results.quantityScore.toFixed(2)}%`,
        `Điểm màu sắc tổng: ${(results.colorScores?.TotalScore ?? 0).toFixed(2)}%`,
        ...(recommendation ? [recommendation] : []),
      ],
    };
  };

  const handleShareResult = async () => {
    const payload = buildSharePayload();
    if (!payload) return;
    const outcome = await shareResultCard(payload);
    if (outcome === "shared") {
      notify.success("Đã chia sẻ ảnh kết quả");
    } else if (outcome === "downloaded") {
      notify.success("Đã lưu ảnh kết quả");
    } else {
      notify.error("Không thể tạo ảnh chia sẻ");
    }
  };

  const handleCompareSubmit = async (event) => {
    event.preventDefault();
    const errors = validateCompatibility(compareValues);
    setCompareErrors(errors);
    if (hasErrors(errors)) return;
    setCompareLoading(true);
    try {
      const response = await assessCompatibility({
        dateOfBirth: parseInt(compareValues.birthYear),
        isMale: compareValues.isMale === "true",
        direction: compareValues.pondDirection,
        pondShape: compareValues.pondShape,
        fishColors: compareValues.koiColors,
        fishQuantity: parseInt(compareValues.koiNumber),
      });
      setComparisonResults(response.data);
    } catch (err) {
      console.error("Error:", err);
      notify.error("Đã xảy ra lỗi khi xử lý yêu cầu của bạn.");
    } finally {
      setCompareLoading(false);
    }
  };

  return (
    <div className="min-h-screen grain-bg bg-paper pb-16">
      <section className="relative overflow-hidden bg-pond text-[#FDF6EC]">
        <div className="mx-auto max-w-7xl px-4 py-14 text-center sm:px-6 md:py-16 lg:px-8">
          <h1 className="font-display text-3xl leading-tight md:text-5xl">
            Tư vấn Bản Mệnh
          </h1>
          <p className="mt-3 text-[15px] text-[#FDF6EC]/80 md:text-base">
            Khám phá sự tương hợp giữa bạn và chú cá Koi theo ngũ hành.
          </p>
        </div>
        <WaveBand
          height={56}
          opacity={0.18}
          color="#C9A227"
          className="absolute bottom-0 left-0 w-full"
        />
      </section>

      <CloudDivider className="mx-auto mt-10 max-w-xs text-gold" />

      <div className="mx-auto mt-8 max-w-xl px-4 sm:px-6">
        <Card className="p-6 md:p-8">
          <Tabs value={formType} onValueChange={handleTabChange}>
            <TabsList>
              <Tab value="element" className="flex-1">
                Tư vấn bản mệnh
              </Tab>
              <Tab value="compatibility" className="flex-1">
                Đánh giá độ phù hợp
              </Tab>
            </TabsList>

            <TabsContent value="element">
              <form onSubmit={handleElementSubmit} className="space-y-5">
                <div>
                  <FieldLabel htmlFor="element-birthYear">Năm sinh</FieldLabel>
                  <Input
                    id="element-birthYear"
                    name="birthYear"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="2003"
                    value={elementValues.birthYear}
                    onChange={(event) =>
                      setElementValues((prev) => ({
                        ...prev,
                        birthYear: event.target.value,
                      }))
                    }
                    error={elementErrors.birthYear}
                    className="mt-2"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <FieldLabel htmlFor="element-isMale">Giới tính</FieldLabel>
                  <select
                    id="element-isMale"
                    name="isMale"
                    value={elementValues.isMale}
                    onChange={(event) =>
                      setElementValues((prev) => ({
                        ...prev,
                        isMale: event.target.value,
                      }))
                    }
                    aria-invalid={!!elementErrors.isMale}
                    className={selectClass(!!elementErrors.isMale)}
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="true">Nam</option>
                    <option value="false">Nữ</option>
                  </select>
                  <FieldError message={elementErrors.isMale} />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  Xem kết quả
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="compatibility">
              <form onSubmit={handleCompatibilitySubmit}>
                <CompatibilityFields
                  idPrefix="compat"
                  values={compatValues}
                  errors={compatErrors}
                  onChange={handleCompatibilityChange}
                />
                <Button
                  type="submit"
                  size="lg"
                  className="mt-6 w-full"
                  disabled={loading}
                >
                  Xem kết quả
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {loading && <ResultSkeleton />}

          {!loading && error && (
            <div className="mt-8 border-t border-gold/25 pt-8">
              <EmptyState
                title="Đã xảy ra lỗi"
                description="Không thể lấy kết quả tư vấn. Vui lòng thử lại."
                action={<Button onClick={handleRetry}>Thử lại</Button>}
              />
            </div>
          )}

          {!loading && !error && results && (
            <div className="relative mt-8 border-t border-gold/25 pt-6">
              <SealStamp
                char="鑑"
                size={40}
                className="absolute -top-5 right-0 animate-seal-in"
              />
              {formType === "element" ? (
                <ElementResult data={results} />
              ) : (
                <>
                  <CompatibilityResult data={results} />
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-6"
                    onClick={() => setCompareOpen(true)}
                  >
                    So sánh trường hợp khác
                  </Button>
                  <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
                    <DialogContent
                      side="right"
                      title="So sánh"
                      description="Nhập thông tin trường hợp thứ hai để so sánh kết quả."
                      className="max-h-full overflow-y-auto"
                    >
                      <form onSubmit={handleCompareSubmit}>
                        <CompatibilityFields
                          idPrefix="compare"
                          values={compareValues}
                          errors={compareErrors}
                          onChange={handleCompareChange}
                        />
                        <Button
                          type="submit"
                          className="mt-6 w-full"
                          disabled={compareLoading}
                        >
                          {compareLoading ? "Đang tính toán…" : "Xem kết quả"}
                        </Button>
                      </form>
                      {comparisonResults && (
                        <div className="mt-6 border-t border-gold/25 pt-6">
                          <h3 className="font-display text-lg text-ink">
                            Kết quả trường hợp mới
                          </h3>
                          <CompatibilityResult data={comparisonResults} />
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </>
              )}
              <Button
                variant="secondary"
                size="sm"
                className="mt-6"
                onClick={handleShareResult}
                aria-label="Chia sẻ kết quả phong thủy"
              >
                <ShareIcon />
                Chia sẻ kết quả
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default KoiCompatibilityForm;
