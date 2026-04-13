export type NavItem = {
  href: string;
  label: string;
};

export type PageSeo = {
  path: string;
  title: string;
  description: string;
  schemaType: string;
};

export type SiteConfig = {
  siteName: string;
  organizationName: string;
  author: string;
  siteUrl: string;
  language: string;
  themeColor: string;
  backgroundColor: string;
  socialImage: string;
  socialImageAlt: string;
  twitterCard: "summary" | "summary_large_image";
  footerDescription: string;
  footerNote: string;
  manifestDescription: string;
  nav: NavItem[];
  pages: PageSeo[];
};

export type MaterialCatalogItem = {
  key: string;
  label: string;
};

export type Ecopoint = {
  id: string;
  type: "ecoponto" | "pev";
  city: string;
  name: string;
  address: string;
  materialKeys: string[];
  hours: string;
  mapsUrl: string;
  lat: number;
  lon: number;
};

export type EcopointsSource = {
  name: string;
  url: string;
  note?: string;
};

export type EcopointsDocument = {
  city: string;
  sourceName: string;
  sourceUrl: string;
  sources: EcopointsSource[];
  consultedAt: string;
  consultedAtDisplay: string;
  materialsCatalog: MaterialCatalogItem[];
  points: Ecopoint[];
};

export type ResourceMedia = {
  src: string;
  alt: string;
  width: number;
  height: number;
  label: string;
};

export type ResourceContext = {
  badge: string;
  title: string;
  kicker: string;
  description?: string;
  featured?: boolean;
};

export type ResourceItem = {
  id: string;
  kind: "article" | "video";
  cta: string;
  url: string;
  media: ResourceMedia;
  home: ResourceContext;
  sources: ResourceContext;
};

export type SourcePanel = {
  title: string;
  description: string;
  url: string;
  cta: string;
};

export type ResourcesDocument = {
  consultedAtDisplay: string;
  homeResourceIds: string[];
  homeSpotlightIds: string[];
  sourcesFeaturedIds: string[];
  sourcesVideoIds: string[];
  sourcePanels: SourcePanel[];
  items: ResourceItem[];
};

export type GeoPoint = {
  id: string;
  lat: number;
  lon: number;
  aliases: string[];
};

export type EcopointsGeoDocument = {
  points: GeoPoint[];
};
