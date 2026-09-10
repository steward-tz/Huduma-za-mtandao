import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowDownRight,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bell,
  Boxes,
  Check,
  ChevronDown,
  CircleDashed,
  Clock3,
  CreditCard,
  FileText,
  LayoutGrid,
  LogIn,
  Menu,
  MessageCircle,
  MoreHorizontal,
  PanelLeftClose,
  Receipt,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  Ticket,
  UserRound,
  WalletCards,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { activitySeed, formatCatalogDate, serviceCatalog, type ServiceCatalogItem } from "../../../shared/catalog";

const iconMap = {
  receipt: Receipt,
  "file-text": FileText,
  sparkles: Sparkles,
  boxes: Boxes,
  "badge-check": BadgeCheck,
  "chart-no-axes-combined": BarChart3,
  "circle-dashed": CircleDashed,
} as const;

type IconName = keyof typeof iconMap;

function ServiceIcon({ name, size = 20 }: { name: string; size?: number }) {
  const Icon = iconMap[name as IconName] ?? CircleDashed;
  return <Icon size={size} strokeWidth={1.8} />;
}

function AppMark({ small = false }: { small?: boolean }) {
  return (
    <div className={`app-mark ${small ? "app-mark--small" : ""}`} aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

const navItems = [
  { href: "/", label: "Muhtasari", icon: LayoutGrid },
  { href: "/services", label: "Huduma", icon: Zap },
  { href: "/workbench", label: "Kituo cha kazi", icon: Ticket },
  { href: "/history", label: "Shughuli", icon: Clock3 },
];

function Sidebar({ onClose }: { onClose?: () => void }) {
  const [location] = useLocation();
  const { user } = useAuth();
  return (
    <aside className="sidebar">
      <div className="sidebar__top">
        <Link href="/" className="brand" onClick={onClose}>
          <AppMark />
          <span>Kituo <b>Digitali</b></span>
        </Link>
        <button className="icon-button sidebar__close" onClick={onClose} aria-label="Close navigation"><PanelLeftClose size={18} /></button>
      </div>
      <div className="workspace-switcher">
        <div className="workspace-avatar">KD</div>
        <div>
          <span className="eyebrow">Eneo la kazi</span>
          <strong>Zana zangu</strong>
        </div>
        <ChevronDown size={15} className="muted-icon" />
      </div>
      <nav className="primary-nav" aria-label="Primary navigation">
        <span className="eyebrow nav-label">Eneo la kazi</span>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? location === "/" : location.startsWith(href);
          return <Link key={href} href={href} onClick={onClose} className={`nav-item ${active ? "is-active" : ""}`}><Icon size={17} /><span>{label}</span>{label === "Shughuli" && <span className="nav-count">3</span>}</Link>;
        })}
        <span className="eyebrow nav-label nav-label--spaced">Simamia</span>
        <Link href="/account" onClick={onClose} className={`nav-item ${location.startsWith("/account") ? "is-active" : ""}`}><Settings2 size={17} /><span>Mipangilio ya akaunti</span></Link>
        <button className="nav-item nav-item--button" onClick={() => toast.info("Kituo cha msaada kinaandaliwa kwa uzinduzi.")}><MessageCircle size={17} /><span>Kituo cha msaada</span></button>
      </nav>
      <div className="sidebar__bottom">
        <div className="sidebar-tip"><div className="tip-icon"><Star size={15} fill="currentColor" /></div><div><strong>Make it yours</strong><p>Connect your own services as your toolkit grows.</p></div></div>
        <div className="sidebar-profile">
          <div className="profile-avatar">{user?.name?.slice(0, 2).toUpperCase() ?? "KD"}</div>
          <div className="profile-copy"><strong>{user?.name ?? "Guest workspace"}</strong><span>{user?.email ?? "Akaunti ya majaribio"}</span></div>
          <MoreHorizontal size={18} className="muted-icon" />
        </div>
      </div>
    </aside>
  );
}

function TopBar({ onMenu }: { onMenu: () => void }) {
  const { isAuthenticated, user } = useAuth();
  return <header className="topbar">
    <button className="icon-button mobile-menu" onClick={onMenu} aria-label="Open navigation"><Menu size={21} /></button>
    <div className="breadcrumbs"><span>Eneo la kazi</span><ArrowRight size={14} /><strong>Muhtasari</strong></div>
    <div className="topbar-actions">
      <button className="topbar-icon" onClick={() => toast("Hakuna arifa mpya", { description: "Umeona kila kitu." })} aria-label="Arifa"><Bell size={18} /><i /></button>
      <span className="topbar-divider" />
      {isAuthenticated ? <div className="topbar-user"><span>{user?.name ?? "Member"}</span><div className="profile-avatar profile-avatar--small">{user?.name?.slice(0, 2).toUpperCase() ?? "KD"}</div></div> : <button className="button button--outline button--small" onClick={() => startLogin()}><LogIn size={15} /> Ingia</button>}
    </div>
  </header>;
}

function SectionHeading({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return <div className="section-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h2>{title}</h2></div>{action}</div>;
}

function ServiceCard({ service, onOpen }: { service: ServiceCatalogItem; onOpen: (service: ServiceCatalogItem) => void }) {
  return <button className={`service-card accent-${service.accent}`} onClick={() => onOpen(service)} disabled={service.status === "soon"}>
    <div className="service-card__top"><span className="service-icon"><ServiceIcon name={service.icon} size={19} /></span>{service.tag && <span className={`card-tag ${service.status === "soon" ? "card-tag--muted" : ""}`}>{service.tag}</span>}<span className="service-card__arrow"><ArrowUpRight /></span></div>
    <div className="service-card__body"><span className="card-category">{service.category}</span><h3>{service.name}</h3><p>{service.description}</p></div>
    <div className="service-card__footer"><span><CreditCard size={14} /> {service.credits} vizio</span><span>{service.status === "soon" ? "Inakuja hivi karibuni" : "Fungua zana"}</span></div>
  </button>;
}

function ServiceModal({ service, onClose }: { service: ServiceCatalogItem; onClose: () => void }) {
  const [, navigate] = useLocation();
  return <div className="modal-backdrop" role="presentation" onClick={onClose}><div className="modal" role="dialog" aria-modal="true" aria-labelledby="service-modal-title" onClick={(event) => event.stopPropagation()}>
    <button className="icon-button modal__close" onClick={onClose} aria-label="Close"><X size={18} /></button>
    <div className={`service-icon service-icon--large accent-${service.accent}`}><ServiceIcon name={service.icon} size={24} /></div>
    <span className="eyebrow">{service.category}</span><h2 id="service-modal-title">{service.name}</h2><p className="modal__description">{service.detail}</p>
    <div className="modal__meta"><span><CreditCard size={15} /> Uses {service.credits} vizio</span><span><ShieldCheck size={15} /> Faragha kwa chaguo-msingi</span></div>
    {service.status === "available" ? <button className="button button--primary button--full" onClick={() => { onClose(); navigate(`/workbench?service=${service.slug}`); }}>Fungua kwenye kituo cha kazi <ArrowRight size={16} /></button> : <button className="button button--muted button--full" onClick={onClose}>Nijulishe ikiwa tayari</button>}
  </div></div>;
}

function BalanceCard() {
  const { user } = useAuth();
  return <div className="balance-card">
    <div className="balance-card__main"><div className="balance-icon"><WalletCards size={21} /></div><div><span className="eyebrow">Salio lililopo</span><div className="balance-number">128 <small>vizio</small></div><p><span className="status-dot" /> Tayari kutumia kwenye zana zako</p></div></div>
    <div className="balance-card__side"><span className="eyebrow">{user ? "Umeingia kama" : "Hali ya majaribio"}</span><strong>{user?.name ?? "Eneo lako la kazi"}</strong><span className="muted-copy">Vizio huongezeka unapoongeza kifurushi.</span><button className="button button--dark" onClick={() => toast.success("Vifurushi vya vizio vitapatikana hivi karibuni.", { description: "Kwa sasa, chunguza zana zilizopo." })}>Ongeza vizio <ArrowDownRight size={16} /></button></div>
  </div>;
}

function Overview({ onOpen }: { onOpen: (service: ServiceCatalogItem) => void }) {
  const [search, setSearch] = useState("");
  const servicesQuery = trpc.services.list.useQuery();
  const services = servicesQuery.data?.length ? servicesQuery.data : serviceCatalog;
  const filtered = useMemo(() => services.filter((service) => `${service.name} ${service.category} ${service.description}`.toLowerCase().includes(search.toLowerCase())), [services, search]);
  return <>
    <section className="hero-panel"><div className="hero-panel__copy"><div className="eyebrow eyebrow--bright"><span className="eyebrow-pulse" /> Kituo chako cha kazi za kidigitali</div><h1>Tengeneza nafasi kwa<br /><em>jambo linalofuata.</em></h1><p>Mkusanyiko wa zana rahisi kwa kazi ndogo zinazoendeleza kazi yako. Chagua huduma, anza, na hifadhi muhimu.</p><div className="hero-meta"><span><Zap size={14} /> Imeundwa kwa kasi</span><span><ShieldCheck size={14} /> Imeundwa kwa eneo lako la kazi</span></div></div><div className="hero-panel__signal"><div className="signal-ring"><div className="signal-core"><Sparkles size={25} /></div></div><span className="signal-label">Eneo moja la kazi<br /><b>mianzo mingi</b></span><div className="signal-lines"><i /><i /><i /></div></div></section>
    <BalanceCard />
    <section className="section-block" id="services"><SectionHeading eyebrow="Anza hapa" title="Huduma zako" action={<Link href="/services" className="text-link">Tazama zote <ArrowRight size={15} /></Link>} /><div className="service-grid">{filtered.slice(0, 4).map((service) => <ServiceCard key={service.slug} service={service} onOpen={onOpen} />)}</div>{filtered.length === 0 && <div className="empty-state"><Search size={20} /><p>No tools match “{search}”. Try another phrase.</p></div>}<div className="inline-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tafuta huduma zako..." aria-label="Tafuta huduma zako" />{search && <button onClick={() => setSearch("")}><X size={15} /></button>}<kbd>⌘ K</kbd></div></section>
    <section className="split-section"><div><SectionHeading eyebrow="Endelea kusonga" title="Fanya hatua yako inayofuata iwe rahisi." /><p className="section-description">Hifadhi kazi za mara moja, violezo na majaribio madogo sehemu moja. Anza na huduma hapa chini au tengeneza mtiririko mpya kwenye kituo cha kazi.</p><Link href="/workbench" className="button button--dark">Fungua kituo cha kazi <ArrowRight size={16} /></Link></div><div className="mini-stat-card"><div className="mini-stat-card__top"><span className="stat-icon"><BarChart3 size={17} /></span><span className="eyebrow">Mwezi huu</span></div><strong>07</strong><p>kazi zimegeuka kuwa hatua inayofuata</p><div className="stat-bars"><i /><i /><i /><i /><i /><i /><i /></div></div></section>
  </>;
}

function ServicesPage({ onOpen }: { onOpen: (service: ServiceCatalogItem) => void }) {
  const [filter, setFilter] = useState("Huduma zote");
  const [query, setQuery] = useState("");
  const categories = ["Huduma zote", ...Array.from(new Set(serviceCatalog.map((service) => service.category)))];
  const filtered = serviceCatalog.filter((service) => (filter === "Huduma zote" || service.category === filter) && `${service.name} ${service.description}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="page-shell"><div className="page-intro"><div><span className="eyebrow">Maktaba</span><h1>Huduma kwa kazi zilizo katikati.</h1><p>Zana rahisi za kubadilisha kazi iliyo wazi kuwa hatua unayoweza kuendelea nayo.</p></div><div className="page-intro__mark"><Zap size={25} /><span>06<br /><small>zana</small></span></div></div><div className="toolbar"><div className="filter-pills">{categories.map((category) => <button className={filter === category ? "is-selected" : ""} onClick={() => setFilter(category)} key={category}>{category}</button>)}</div><label className="search-field"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tafuta huduma" /></label></div><div className="service-grid service-grid--all">{filtered.map((service) => <ServiceCard key={service.slug} service={service} onOpen={onOpen} />)}</div></section>;
}

function WorkbenchPage() {
  const [location, navigate] = useLocation();
  const serviceSlug = new URLSearchParams(location.split("?")[1] ?? "").get("service") ?? "invoice-studio";
  const selected = serviceCatalog.find((service) => service.slug === serviceSlug) ?? serviceCatalog[0];
  const [brief, setBrief] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [runReference, setRunReference] = useState<string | null>(null);
  const [service, setService] = useState(selected.slug);
  const selectedService = serviceCatalog.find((item) => item.slug === service) ?? selected;
  const createRun = trpc.workItems.create.useMutation({
    onSuccess: (result) => {
      setRunReference(result.reference);
      setSubmitted(true);
      toast.success("Kazi yako imewekwa kwenye foleni.", { description: `Reference ${result.reference} is now in Activity.` });
    },
    onError: (error) => toast.error("Hatukuweza kuhifadhi kazi hiyo.", { description: error.message }),
  });
  function submit(event: React.FormEvent) {
    event.preventDefault();
    createRun.mutate({ serviceSlug: selectedService.slug, brief });
  }
  return <section className="page-shell"><div className="page-intro page-intro--compact"><div><span className="eyebrow">Kituo cha kazi</span><h1>Anza na maelezo yaliyo wazi.</h1><p>Ipe zana maelezo ya kutosha. Unaweza kurudi na kuyaboresha wakati wowote.</p></div><div className="workbench-status"><span className="status-dot" /> Uhifadhi wa moja kwa moja</div></div><div className="workbench-layout"><form className="workbench-form" onSubmit={submit}><div className="form-step"><span className="step-number">01</span><div className="form-step__content"><label htmlFor="service">Chagua huduma</label><p>Chagua mwanzo bora wa kazi hii.</p><select id="service" value={service} onChange={(event) => { setService(event.target.value); navigate(`/workbench?service=${event.target.value}`); }}>{serviceCatalog.filter((item) => item.status === "available").map((item) => <option key={item.slug} value={item.slug}>{item.name} · {item.credits} vizio</option>)}</select></div></div><div className="form-step"><span className="step-number">02</span><div className="form-step__content"><label htmlFor="brief">Unajaribu kuendeleza jambo gani?</label><p>Sentensi chache zinatosha. Epuka taarifa nyeti.</p><textarea id="brief" rows={7} value={brief} onChange={(event) => setBrief(event.target.value)} placeholder="Mfano: Nahitaji ankara rahisi kwa mradi wa mteja wa mara kwa mara..." required /></div></div><div className="form-footer"><span><ShieldCheck size={15} /> Rasimu yako inabaki kwenye eneo hili la kazi.</span><button className="button button--primary" type="submit" disabled={createRun.isPending}> {createRun.isPending ? "Inahifadhi..." : <>Endesha {selectedService.name} <ArrowRight size={16} /></>}</button></div></form><aside className="workbench-aside"><div className={`preview-tool-card accent-${selectedService.accent}`}><div className="service-icon"><ServiceIcon name={selectedService.icon} /></div><span className="eyebrow">Zana iliyochaguliwa</span><h2>{selectedService.name}</h2><p>{selectedService.detail}</p><div className="preview-tool-card__bottom"><span><CreditCard size={14} /> {selectedService.credits} vizio</span><span className="status-badge"><span className="status-dot" /> Tayari</span></div></div><div className="tip-card"><Sparkles size={17} /><div><strong>Maelezo mazuri huwa mahususi.</strong><p>Taja walengwa, matokeo na masharti muhimu.</p></div></div></aside></div>{submitted && <div className="success-banner"><div className="success-icon"><Check size={17} /></div><div><strong>Kazi ya majaribio imeundwa</strong><p>{runReference ? `Kumbukumbu ${runReference} imehifadhiwa kwenye Shughuli.` : "Your work item is ready in Shughuli."} Huu ni mtiririko salama wa majaribio hadi uunganishe huduma ya uzalishaji.</p></div><Link href="/history" className="text-link">Tazama shughuli <ArrowRight size={15} /></Link></div>}</section>;
}

function HistoryPage() {
  const recentQuery = trpc.activity.recent.useQuery();
  const rows = recentQuery.data?.length ? recentQuery.data : activitySeed;
  return <section className="page-shell"><div className="page-intro page-intro--compact"><div><span className="eyebrow">Shughuli</span><h1>Rekodi tulivu ya maendeleo.</h1><p>Kila kazi, namba ya kumbukumbu na matumizi ya vizio sehemu moja.</p></div><button className="button button--outline" onClick={() => toast("Uhamishaji unakuja hivi karibuni.")}><ArrowDownRight size={16} /> Hamisha</button></div><div className="activity-card"><div className="activity-card__header"><div><span className="eyebrow">Kazi za hivi karibuni</span><h2>Shughuli za mwisho</h2></div><span className="activity-count">{rows.length} rekodi</span></div><div className="activity-table"><div className="activity-row activity-row--head"><span>Huduma</span><span>Kumbukumbu</span><span>Vizio</span><span>Hali</span><span>Tarehe</span></div>{rows.map((row) => <div className="activity-row" key={row.reference}><div className="activity-service"><span className="table-icon"><Check size={14} /></span><span><strong>{row.service}</strong><small>{row.type}</small></span></div><span className="mono">{row.reference}</span><span className="credit-use"><CreditCard size={14} /> {row.credits}</span><span><span className="table-status"><i />{row.status}</span></span><span className="date-copy">{formatCatalogDate(row.createdAt)}</span></div>)}</div></div></section>;
}

function AccountPage() {
  const { user, isAuthenticated } = useAuth();
  return <section className="page-shell"><div className="page-intro page-intro--compact"><div><span className="eyebrow">Akaunti</span><h1>Fanya eneo hili liwe lako.</h1><p>Panga utambulisho, mapendeleo na taarifa zako za ufikiaji.</p></div></div><div className="account-grid"><div className="account-card account-card--profile"><div className="profile-avatar profile-avatar--large">{user?.name?.slice(0, 2).toUpperCase() ?? "KD"}</div><span className="eyebrow">{isAuthenticated ? "Mwanachama wa eneo la kazi" : "Akaunti ya majaribio"}</span><h2>{user?.name ?? "Your name here"}</h2><p>{user?.email ?? "Ingia kuunganisha your account details."}</p><button className="button button--outline" onClick={() => isAuthenticated ? toast("Uhariri wa wasifu unakuja hivi karibuni.") : startLogin()}>{isAuthenticated ? "Hariri wasifu" : "Ingia kuunganisha"}</button></div><div className="account-card"><div className="account-card__header"><span className="service-icon service-icon--soft"><ShieldCheck size={18} /></span><div><span className="eyebrow">Faragha</span><h3>Imeundwa kwa eneo lako la kazi</h3></div></div><p>Maelezo ya huduma na shughuli hubaki kwenye akaunti yako. Ukiwa tayari, unaweza kuongeza miunganisho yako bila kubadilisha urambazaji mkuu.</p><div className="setting-line"><span>Usalama wa kipindi</span><span className="setting-value"><span className="status-dot" /> Imelindwa</span></div><div className="setting-line"><span>Arifa</span><button className="text-link" onClick={() => toast("Mapendeleo ya arifa yanakuja hivi karibuni.")}>Simamia <ArrowRight size={14} /></button></div></div><div className="account-card account-card--wide"><div className="account-card__header"><span className="service-icon service-icon--soft"><CreditCard size={18} /></span><div><span className="eyebrow">Vizio</span><h3>Matumizi na salio</h3></div></div><div className="usage-layout"><div><strong>128</strong><span>vizio vilivyopo</span></div><div className="usage-bar"><span style={{ width: "36%" }} /></div><p>36% ya mgao wako wa kila mwezi wa kuanzia imetumika.</p></div></div></div></section>;
}

export default function Home() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceCatalogItem | null>(null);
  const page = location.split("?")[0];
  return <div className="app-frame"><div className={`mobile-overlay ${menuOpen ? "is-visible" : ""}`} onClick={() => setMenuOpen(false)} /><div className={`sidebar-drawer ${menuOpen ? "is-open" : ""}`}><Sidebar onClose={() => setMenuOpen(false)} /></div><div className="desktop-sidebar"><Sidebar /></div><main className="main-content"><TopBar onMenu={() => setMenuOpen(true)} /><div className="content-wrap">{page === "/services" ? <ServicesPage onOpen={setSelectedService} /> : page === "/workbench" ? <WorkbenchPage /> : page === "/history" ? <HistoryPage /> : page === "/account" ? <AccountPage /> : <Overview onOpen={setSelectedService} />}</div><footer className="site-footer"><span><AppMark small /> Kituo Digitali</span><span>Wazo la zana huru · Tayari kupanuliwa</span></footer></main>{selectedService && <ServiceModal service={selectedService} onClose={() => setSelectedService(null)} />}</div>;
}

function ArrowUpRight() {
  return <ArrowRight size={16} className="arrow-up-right" />;
}
