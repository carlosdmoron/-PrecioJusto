export type EntityType = "individual" | "empresa";

export type PaymentMethodType = "tarjeta" | "paypal" | "transferencia";

export type PaymentMethod = {
  tipo: PaymentMethodType;
  titular?: string;
  numero?: string;
  caducidad?: string;
  cvc?: string;
  emailPaypal?: string;
  iban?: string;
};

export type OnboardingData = {
  entityType: EntityType | null;
  firstName: string;
  lastName: string;
  phoneCountryCode: string;
  phoneNumber: string;
  email: string;
  allowPromotions: boolean;
  province: string;
  municipality: string;
  selectedServices: string[];
  valueProposition: string;
  profilePhotoUrl: string;
  portfolioPhotos: string[];
  paymentMethod: PaymentMethod;
};

export const ONBOARDING_DATA_INICIAL: OnboardingData = {
  entityType: null,
  firstName: "",
  lastName: "",
  phoneCountryCode: "+34",
  phoneNumber: "",
  email: "",
  allowPromotions: false,
  province: "",
  municipality: "",
  selectedServices: [],
  valueProposition: "",
  profilePhotoUrl: "",
  portfolioPhotos: [],
  paymentMethod: { tipo: "tarjeta" },
};

export const PORTFOLIO_MAX_FOTOS = 5;

export type MilestoneKey = 0 | 1 | 2 | 3;
