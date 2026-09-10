import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  BadgeCheck, Baby, Bell, CarFront, ChevronRight, CircleAlert, CircleDollarSign, Contact, Copy, CreditCard, ExternalLink, FileBadge, FileWarning, HeartHandshake, History, Image, Landmark, LayoutGrid, LockKeyhole, LogIn, Menu, MessageCircle, Music2, Palette, Plane, PlayCircle, QrCode, Radio, Search, ScanFace, Settings2, ShieldCheck, Smartphone, Sparkles, Star, Store, Ticket, Trophy, Tv, UserRound, UserRoundPen, Users, Vote, WalletCards, X, Zap,
} from "lucide-react";
import { toast } from "sonner";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { announcementText, activitySeed, serviceCatalog, specialServices, tutorials, whatsappUrl, type ServiceCatalogItem } from "../../../shared/catalog";

const icons: Record<string, React.ElementType> = { "file-badge": FileBadge, "badge-check": BadgeCheck, contact: Contact, "qr-code": QrCode, vote: Vote, store: Store, ticket: Ticket, copy: Copy, "car-front": CarFront, search: Search, landmark: Landmark, baby: Baby, plane: Plane, "heart-handshake": HeartHandshake, "file-warning": FileWarning, "music-2": Music2, "image-search": Image, smartphone: Smartphone, "scan-face": ScanFace, "user-round-pen": UserRoundPen, palette: Palette, radio: Radio, trophy: Trophy, star: Star, tv: Tv };

function Icon({ name, size = 22 }: { name: string; size?: number }) { const Component = icons[name] ?? Sparkles; return <Component size={size} strokeWidth={1.9} />; }

function Notice({ children, tone = "warning" }: { children: React.ReactNode; tone?: "warning" | "success" | "info" }) { return <div className={`notice notice--${tone}`}><CircleAlert size={17} /> <span>{children}</span></div>; }

function AppHeader({ onMenu, search, setSearch }: { onMenu: () => void; search: string; setSearch: (value: string) => void }) {
  const { isAuthenticated, user } = useAuth();
  return <>
    <div className="announcement"><Bell size={17} /> <strong>{announcementText}</strong></div>
    <header className="app-header">
      <button className="mobile-menu" onClick={onMenu} aria-label="Fungua menyu"><Menu size={24} /></button>
      <Link href="/" className="portal-brand"><span className="portal-logo"><Zap size={20} /></span><span>HUDUMA ZA <b>MTANDAONI</b></span></Link>
      <label className="global-search"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tafuta chochote kwenye Google..." /><kbd>⌘ K</kbd></label>
      <div className="header-actions"><button className="header-icon" onClick={() => toast("Hakuna arifa mpya kwa sasa.")} aria-label="Arifa"><Bell size={19} /><i /></button>{isAuthenticated ? <span className="header-user">{user?.name ?? "Mwanachama"}</span> : <button className="button button--green button--small" onClick={() => startLogin()}><LogIn size={15} /> Ingia / Jisajili</button>}</div>
    </header>
  </>;
}

function Sidebar({ onClose }: { onClose?: () => void }) {
  const [location] = useLocation();
  const { user } = useAuth();
  const items = [{ href: "/", label: "Mwanzo", icon: LayoutGrid }, { href: "/services", label: "Huduma zote", icon: Zap }, { href: "/tokens", label: "Tokeni", icon: CircleDollarSign }, { href: "/history", label: "Historia", icon: History }, { href: "/account", label: "Akaunti", icon: UserRound }];
  return <aside className="sidebar-portal"><div className="sidebar-brand"><Link href="/" onClick={onClose}>HUDUMA ZA <b>MTANDAONI</b></Link><button className="sidebar-close" onClick={onClose}><X size={20} /></button></div><div className="sidebar-user"><div className="user-avatar">{user?.name?.slice(0, 2).toUpperCase() ?? "HM"}</div><div><strong>{user?.name ?? "Mgeni"}</strong><small>{user ? "Akaunti yangu" : "Ingia kuanza"}</small></div></div><nav>{items.map(({ href, label, icon: ItemIcon }) => <Link key={href} href={href} onClick={onClose} className={`portal-nav-item ${href === "/" ? location === "/" : location.startsWith(href) ? "active" : ""}`}><ItemIcon size={19} /><span>{label}</span></Link>)}</nav>{user?.role === "admin" && <Link href="/admin" className={`portal-nav-item admin-link ${location.startsWith("/admin") ? "active" : ""}`}><Settings2 size={19} /><span>Paneli ya Admin</span></Link>}<div className="sidebar-foot"><ShieldCheck size={17} /><span>Huduma salama<br /><small>Tokeni zako zinalindwa.</small></span></div></aside>;
}

function TokenCard({ compact = false }: { compact?: boolean }) {
  const { isAuthenticated } = useAuth();
  const profile = trpc.portal.profile.useQuery(undefined, { enabled: isAuthenticated, retry: false });
  const balance = profile.data?.tokenBalance ?? 0;
  const status = profile.data?.verificationStatus ?? "pending";
  return <section className={`token-card ${compact ? "token-card--compact" : ""}`}><div className="token-card__top"><div className="token-icon"><WalletCards size={26} /></div><div><span className="overline">Tokeni zako</span><strong>{balance}</strong><span className="token-label">tokeni</span></div></div><div className="token-card__meta"><span>Namba yako: <b>{profile.data?.phone ?? "0698232313"}</b></span><span className={`verification verification--${status}`}>{status === "approved" ? "Imeidhinishwa" : "Haijathibitishwa"}</span></div>{status !== "approved" && <div className="account-warning">Akaunti yako haijathibitishwa na admin. Tafadhali wasiliana na admin ili aidhinishe na akupe tokeni.</div>}<a className="button button--green button--wide" href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={18} /> NUNUA TOKENI (WHATSAPP)</a><small className="token-note">Kila upakuaji hukata tokeni 2.</small></section>;
}

function ServiceCard({ service, onUse }: { service: ServiceCatalogItem; onUse: (service: ServiceCatalogItem) => void }) {
  const locked = service.kind === "locked";
  return <button className={`portal-service-card service-${service.kind}`} onClick={() => onUse(service)}><div className="service-card-icon"><Icon name={service.icon} /></div><div className="service-card-copy"><strong>{service.name}</strong><span>{service.description}</span></div><div className="service-card-foot">{locked ? <span className="locked-label"><LockKeyhole size={14} /> IMEFUNGWA</span> : service.kind === "free" ? <span className="free-label">Bure</span> : <span className="paid-label"><CreditCard size={14} /> Tokeni {service.tokenCost}</span>}<ChevronRight size={17} /></div></button>;
}

function ServiceGrid({ title, services, onUse }: { title: string; services: ServiceCatalogItem[]; onUse: (service: ServiceCatalogItem) => void }) { return <section className="portal-section"><div className="section-title"><div><span className="overline">Mkusanyiko wa huduma</span><h2>{title}</h2></div><span className="section-count">{services.length}</span></div><div className="portal-service-grid">{services.map((service) => <ServiceCard key={service.slug} service={service} onUse={onUse} />)}</div></section>; }

function SpecialSection() {
  const open = (item: typeof specialServices[number]) => { if (item.action === "whatsapp") window.open(whatsappUrl, "_blank", "noopener,noreferrer"); else toast("Tuma ujumbe WhatsApp kupata maelezo ya malipo.", { action: { label: "WhatsApp", onClick: () => window.open(whatsappUrl, "_blank") } }); };
  return <section className="portal-section"><div className="section-title"><div><span className="overline">Ofa na jumuiya</span><h2>HUDUMA MAALUM</h2></div></div><div className="special-grid">{specialServices.map((item) => <button key={item.slug} className={`special-card special-card--${item.tone}`} onClick={() => open(item)}><div><strong>{item.name}</strong><small>{item.action === "whatsapp" ? "Fungua WhatsApp" : "Wasiliana nasi kwa malipo"}</small></div><ExternalLink size={18} /></button>)}</div></section>;
}

function TutorialsSection() {
  const [selected, setSelected] = useState<typeof tutorials[number] | null>(null);
  return <section className="portal-section"><div className="section-title"><div><span className="overline">Jifunze kwa hatua</span><h2>VIDEO ZA MAFUNZO</h2></div></div><div className="tutorial-grid">{tutorials.map((item) => <button className="tutorial-card" key={item.slug} onClick={() => setSelected(item)}><span className="play-circle"><PlayCircle size={25} /></span><strong>{item.title}</strong><small>{item.description}</small><span className="paid-label"><CreditCard size={13} /> Tokeni {item.tokenCost}</span></button>)}</div>{selected && <div className="portal-modal-backdrop" onClick={() => setSelected(null)}><div className="portal-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setSelected(null)}><X size={19} /></button><PlayCircle size={42} className="modal-symbol" /><h3>{selected.title}</h3>{selected.videoUrl ? <video src={selected.videoUrl} controls /> : <Notice tone="info">Video itaongezwa na admin hivi karibuni. Hakuna kiungo bandia kilichowekwa.</Notice>}<button className="button button--green button--wide" onClick={() => setSelected(null)}>Funga</button></div></div>}</section>;
}

function HistoryPage() {
  const { isAuthenticated } = useAuth();
  const query = trpc.portal.tokenHistory.useQuery(undefined, { enabled: isAuthenticated });
  const activityQuery = trpc.portal.activity.useQuery(undefined, { enabled: isAuthenticated });
  const rows = activityQuery.data?.length ? activityQuery.data : activitySeed;
  return <main className="portal-main"><div className="page-heading"><div><span className="overline">Rekodi zako</span><h1>HISTORIA YA TOKENI</h1><p>Angalia tokeni zilizotumika, zilizoongezwa na salio lako.</p></div></div><div className="history-table"><div className="history-head"><span>Tarehe</span><span>Huduma</span><span>Tokeni</span><span>Salio</span><span>Rejea</span></div>{query.data?.length ? query.data.map((row) => <div className="history-row" key={row.reference}><span>{new Date(row.createdAt).toLocaleString("sw-TZ")}</span><strong>{row.description}</strong><span className={row.amount < 0 ? "amount-negative" : "amount-positive"}>{row.amount > 0 ? "+" : ""}{row.amount}</span><span>{row.balanceAfter}</span><code>{row.reference}</code></div>) : rows.map((row) => <div className="history-row" key={row.reference}><span>{new Date(row.createdAt).toLocaleDateString("sw-TZ")}</span><strong>{row.service}</strong><span className="amount-negative">-{row.credits}</span><span>0</span><code>{row.reference}</code></div>)}</div><Notice tone="info">Historia halisi ya tokeni itaonekana baada ya kuingia na kutumia huduma.</Notice></main>;
}

function AdminPage() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const stats = trpc.admin.stats.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });
  const users = trpc.admin.users.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });
  const services = trpc.admin.services.useQuery(undefined, { enabled: isAuthenticated && user?.role === "admin" });
  const verify = trpc.admin.verifyUser.useMutation({ onSuccess: () => { users.refetch(); toast.success("Hali ya mtumiaji imesasishwa."); } });
  const adjust = trpc.admin.adjustTokens.useMutation({ onSuccess: () => { users.refetch(); toast.success("Tokeni zimesasishwa."); } });
  if (!isAuthenticated || user?.role !== "admin") return <main className="portal-main"><Notice>Ukurasa huu ni wa admin pekee. Ingia kwa akaunti yenye ruhusa ya admin.</Notice><button className="button button--green" onClick={() => startLogin()}>Ingia</button></main>;
  const data = stats.data ?? { totalUsers: 0, pendingUsers: 0, approvedUsers: 0, totalTokensIssued: 0, totalTokensUsed: 0, totalServiceUsage: 0 };
  const section = location.split("/")[2] ?? "overview";
  const tabs = [["/admin", "Muhtasari"], ["/admin/users", "Watumiaji"], ["/admin/tokens", "Tokeni"], ["/admin/services", "Huduma"], ["/admin/videos", "Video"], ["/admin/transactions", "Miamala"], ["/admin/announcements", "Matangazo"], ["/admin/settings", "Mipangilio"]] as const;
  return <main className="portal-main"><div className="page-heading"><div><span className="overline">Udhibiti wa mfumo</span><h1>PANELI YA ADMIN</h1><p>Simamia watumiaji, tokeni, huduma na matumizi.</p></div></div><div className="admin-tabs">{tabs.map(([href, label]) => <Link key={href} href={href} className={location === href ? "active" : ""}>{label}</Link>)}</div>{section === "overview" && <div className="admin-stats">{[["Watumiaji wote", data.totalUsers], ["Wanasubiri", data.pendingUsers], ["Wameidhinishwa", data.approvedUsers], ["Tokeni zilizotolewa", data.totalTokensIssued], ["Tokeni zilizotumika", data.totalTokensUsed], ["Matumizi ya huduma", data.totalServiceUsage]].map(([label, value]) => <div className="admin-stat" key={label as string}><span>{label}</span><strong>{value}</strong></div>)}</div>}{(section === "overview" || section === "users" || section === "tokens") && <section className="admin-panel"><div className="section-title"><h2>{section === "tokens" ? "Usimamizi wa tokeni" : "Watumiaji"}</h2><span className="section-count">{users.data?.length ?? 0}</span></div><div className="admin-users">{users.data?.map((person) => <div className="admin-user-row" key={person.id}><div className="user-avatar">{person.name?.slice(0, 2).toUpperCase() ?? "HM"}</div><div className="admin-user-copy"><strong>{person.name ?? "Bila jina"}</strong><span>{person.email ?? "Hakuna barua pepe"} · {person.tokenBalance} tokeni</span></div><span className={`verification verification--${person.verificationStatus}`}>{person.verificationStatus}</span><div className="admin-user-actions">{person.verificationStatus !== "approved" && <button onClick={() => verify.mutate({ userId: person.id, status: "approved" })}>Idhinisha</button>}<button onClick={() => adjust.mutate({ userId: person.id, amount: 20, description: "Tokeni zilizoongezwa na admin" })}>+20 tokeni</button></div></div>)}</div></section>}{section === "services" && <section className="admin-panel"><div className="section-title"><h2>Huduma zote</h2><span className="section-count">{services.data?.length ?? 0}</span></div><div className="admin-users">{services.data?.map((service) => <div className="admin-user-row" key={service.slug}><div className="service-card-icon"><Icon name={service.icon} size={18} /></div><div className="admin-user-copy"><strong>{service.name}</strong><span>{service.category} · {service.kind === "free" ? "Bure" : service.kind === "locked" ? "Imefungwa" : `Tokeni ${service.tokenCost}`}</span></div></div>)}</div></section>}{section === "videos" && <section className="admin-panel"><div className="section-title"><h2>Video za mafunzo</h2></div><Notice tone="info">Ongeza video halisi kupitia mfumo wa admin utakapoingiza URL ya video. Mfumo hauhifadhi URL bandia.</Notice></section>}{section === "transactions" && <section className="admin-panel"><div className="section-title"><h2>Miamala ya tokeni</h2></div><Notice tone="info">Miamala yote ya tokeni huhifadhiwa na audit reference kwenye database.</Notice></section>}{section === "announcements" && <section className="admin-panel"><div className="section-title"><h2>Matangazo</h2></div><div className="notice notice--warning">Wasiliana na 0698232313 kwa huduma za tokeni n.k</div></section>}{section === "settings" && <section className="admin-panel"><div className="section-title"><h2>Mipangilio ya mfumo</h2></div><Notice tone="success">Tokeni za huduma zinazolipiwa: 2. Huduma za bure hazikati tokeni.</Notice></section>}</main>;
}

function AccountPage() { const { isAuthenticated, user, logout } = useAuth(); return <main className="portal-main"><div className="page-heading"><div><span className="overline">Wasifu na usalama</span><h1>AKAUNTI</h1><p>Simamia taarifa za akaunti yako.</p></div></div><section className="account-panel"><div className="large-avatar">{user?.name?.slice(0, 2).toUpperCase() ?? "HM"}</div><h2>{user?.name ?? "Mgeni"}</h2><p>{user?.email ?? "Hujaingia kwenye akaunti."}</p>{isAuthenticated ? <><Notice tone="success">Umeingia kwa usalama kupitia mfumo wa uthibitishaji.</Notice><button className="button button--dark" onClick={() => logout()}>Toka kwenye akaunti</button></> : <button className="button button--green" onClick={() => startLogin()}>Ingia / Jisajili</button>}</section></main>; }

function PortalHome({ search, onUse }: { search: string; onUse: (service: ServiceCatalogItem) => void }) {
  const lower = search.toLowerCase();
  const matches = serviceCatalog.filter((service) => `${service.name} ${service.description} ${service.category}`.toLowerCase().includes(lower));
  const main = matches.filter((service) => service.category === "Huduma kuu" || service.category === "Huduma za bure");
  const locked = matches.filter((service) => service.kind === "locked");
  const tools = matches.filter((service) => service.category === "Zana za ziada");
  return <main className="portal-main"><div className="welcome-strip"><div><span className="overline">Karibu HUDUMA ZA MTANDAONI</span><h1>Huduma zako, sehemu moja.</h1><p>Chagua huduma unayotaka. Tokeni hukatwa kwa usalama kwenye mfumo.</p></div><Sparkles size={44} /></div><TokenCard /><ServiceGrid title="HUDUMA ZOTE" services={main} onUse={onUse} /><ServiceGrid title="HUDUMA ZILIZOFUNGWA" services={locked} onUse={onUse} /><SpecialSection /><ServiceGrid title="ZANA ZA ZIADA" services={tools} onUse={onUse} /><TutorialsSection /></main>;
}

function BottomNav() { return <nav className="bottom-nav">{[{ href: "/", label: "Mwanzo", icon: LayoutGrid }, { href: "/services", label: "Huduma", icon: Zap }, { href: "/tokens", label: "Tokeni", icon: CircleDollarSign }, { href: "/history", label: "Historia", icon: History }, { href: "/account", label: "Akaunti", icon: UserRound }].map(({ href, label, icon: ItemIcon }) => <Link href={href} key={href}><ItemIcon size={19} /><span>{label}</span></Link>)}</nav>; }

export default function Home() {
  const [location, navigate] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { isAuthenticated } = useAuth();
  const useService = trpc.portal.useService.useMutation({ onSuccess: (result) => toast.success(`${result.service} imefunguliwa.`, { description: `Rejea: ${result.reference}` }), onError: (error) => toast.error(error.message) });
  const handleUse = (service: ServiceCatalogItem) => { if (service.kind === "locked") { toast.error("Huduma hii imefungwa kwa sasa."); return; } if (!isAuthenticated) { toast("Ingia kwanza ili kutumia huduma."); startLogin(); return; } useService.mutate({ serviceSlug: service.slug, brief: "Matumizi kupitia portal ya HUDUMA ZA MTANDAONI" }); };
  const page = location.startsWith("/admin") ? <AdminPage /> : location === "/history" ? <HistoryPage /> : location === "/account" ? <AccountPage /> : location === "/tokens" ? <main className="portal-main"><TokenCard /><Notice tone="info">Nunua tokeni kupitia WhatsApp ili admin aweze kukuwekea tokeni kwenye akaunti yako.</Notice></main> : <PortalHome search={search} onUse={handleUse} />;
  return <div className="portal-shell"><div className={`portal-overlay ${menuOpen ? "show" : ""}`} onClick={() => setMenuOpen(false)} /><div className={`portal-sidebar-wrap ${menuOpen ? "open" : ""}`}><Sidebar onClose={() => setMenuOpen(false)} /></div><div className="portal-content"><AppHeader onMenu={() => setMenuOpen(true)} search={search} setSearch={setSearch} />{page}<footer className="portal-footer">Programu hii ilitengenezwa na Bw. Zoom Cotex Limited <span>© Haki zote zimehifadhiwa 2026</span></footer></div><BottomNav /></div>;
}
