--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2025-09-29 01:57:44

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 229 (class 1255 OID 24704)
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_updated_at() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 217 (class 1259 OID 24705)
-- Name: kerveny; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kerveny (
    id integer NOT NULL,
    nev character varying(100),
    leiras character varying(500),
    helyszin character varying(150),
    cim character varying(200),
    kezdo_datum timestamp without time zone,
    veg_datum timestamp without time zone,
    kezdo_idopont time without time zone,
    veg_idopont time without time zone,
    tipus character varying(50),
    minosites character varying(50),
    sajto boolean,
    jelleg character varying(100),
    programterv character varying(1000),
    berendezesi_mod character varying(500),
    szallasigeny boolean,
    szallasigeny_letszam integer,
    parkolo boolean,
    parkolo_reszletek character varying(300),
    internet boolean,
    hulladek boolean,
    hulladek_elszallitas_modja character varying(50),
    hulladek_elszallitas_felelos character varying(100),
    letszam integer,
    email character varying(100),
    telefon character varying(20),
    oktatastechnika boolean,
    oktatas_eszkozok character varying(300),
    korlatozott_mozgas boolean,
    korlatozott_mozgas_reszletek character varying(300),
    foto boolean,
    foto_reszletek character varying(300),
    cater boolean,
    catering_tipus character varying(300),
    epites boolean,
    epites_kezdet timestamp without time zone,
    epites_veg timestamp without time zone,
    epites_vallalkozok character varying(200),
    epites_magas boolean,
    epites_allvany boolean,
    epites_kezi boolean,
    epites_gepi boolean,
    takaritas boolean,
    takaritas_alatt boolean,
    villanyszerelo character varying(50),
    aramigeny character varying(50),
    leg_szennyezes character varying(50),
    egyeb_tevekenyseg character varying(300),
    vegyi_anyag boolean,
    vegyi_anyag_leiras character varying(300),
    tuzveszelyes_tevekenyseg boolean,
    tuzveszelyes_tevekenyseg_leiras character varying(300),
    dekoracio boolean,
    dekoracio_leiras character varying(300),
    felelos character varying(100),
    lakcim character varying(200),
    tovabbi_szervezo character varying(100),
    tovabbi_telefon character varying(20),
    tovabbi_email character varying(100),
    tovabbi_neptun character varying(6),
    tovabbi_lakcim character varying(200),
    megrendelo_nev character varying(100),
    megrendelo_cim character varying(200),
    megrendelo_ado character varying(15),
    megrendelo_telefon character varying(20),
    megrendelo_email character varying(100),
    portaszolgalat boolean,
    portaszolgalat_leiras character varying(300),
    statusz text DEFAULT 'BEERKEZETT'::text,
    koltseg_osszesen numeric(14,2)
);


ALTER TABLE public.kerveny OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 24711)
-- Name: kerveny_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.kerveny ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.kerveny_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 219 (class 1259 OID 24712)
-- Name: kerveny_koltseg; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kerveny_koltseg (
    id bigint NOT NULL,
    kerveny_id bigint NOT NULL,
    service_id bigint,
    service_name text,
    rate_key text,
    unit text,
    hours numeric(12,2) DEFAULT 0,
    persons numeric(12,2) DEFAULT 0,
    unit_price numeric(14,2) DEFAULT 0,
    line_total numeric(14,2) DEFAULT 0,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.kerveny_koltseg OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 24722)
-- Name: kerveny_koltseg_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.kerveny_koltseg_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.kerveny_koltseg_id_seq OWNER TO postgres;

--
-- TOC entry 4879 (class 0 OID 0)
-- Dependencies: 220
-- Name: kerveny_koltseg_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.kerveny_koltseg_id_seq OWNED BY public.kerveny_koltseg.id;


--
-- TOC entry 221 (class 1259 OID 24723)
-- Name: prices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prices (
    id integer NOT NULL,
    megnevezes text NOT NULL,
    kategoria text,
    mertekegyseg text,
    ar_egyetem numeric DEFAULT 0,
    ar_egyetem_hetvege numeric DEFAULT 0,
    ar_kulso numeric DEFAULT 0,
    ar_kulso_hetvege numeric DEFAULT 0,
    megjegyzes text
);


ALTER TABLE public.prices OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 24732)
-- Name: prices_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prices_id_seq OWNER TO postgres;

--
-- TOC entry 4880 (class 0 OID 0)
-- Dependencies: 222
-- Name: prices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prices_id_seq OWNED BY public.prices.id;


--
-- TOC entry 223 (class 1259 OID 24733)
-- Name: role_audit; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_audit (
    id integer NOT NULL,
    user_id integer,
    neptun_code character varying(12),
    old_role character varying(60),
    new_role character varying(60) NOT NULL,
    changed_by character varying(200),
    reason text,
    changed_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.role_audit OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 24739)
-- Name: role_audit_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.role_audit_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.role_audit_id_seq OWNER TO postgres;

--
-- TOC entry 4881 (class 0 OID 0)
-- Dependencies: 224
-- Name: role_audit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.role_audit_id_seq OWNED BY public.role_audit.id;


--
-- TOC entry 225 (class 1259 OID 24740)
-- Name: statusz; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.statusz (
    id integer NOT NULL,
    code character varying(60) NOT NULL,
    label character varying(120) NOT NULL,
    phase character varying(40) NOT NULL,
    terminal boolean DEFAULT false NOT NULL,
    sort_order integer NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.statusz OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 24747)
-- Name: statusz_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.statusz_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.statusz_id_seq OWNER TO postgres;

--
-- TOC entry 4882 (class 0 OID 0)
-- Dependencies: 226
-- Name: statusz_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.statusz_id_seq OWNED BY public.statusz.id;


--
-- TOC entry 227 (class 1259 OID 24748)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    email character varying(255) NOT NULL,
    password_hash text,
    full_name character varying(255),
    neptun_code character varying(6),
    role character varying(30) DEFAULT 'Uni-Famulus'::character varying NOT NULL,
    role_assigned_at timestamp with time zone,
    is_active boolean DEFAULT true NOT NULL,
    last_login timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    avatar_url character varying(255),
    CONSTRAINT users_neptun_format CHECK (((neptun_code IS NULL) OR ((neptun_code)::text ~ '^[A-Za-z0-9]{6}$'::text))),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY (ARRAY[('Admin'::character varying)::text, ('Főadmin'::character varying)::text, ('Uni-Famulus'::character varying)::text])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 24759)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 4883 (class 0 OID 0)
-- Dependencies: 228
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4668 (class 2604 OID 24760)
-- Name: kerveny_koltseg id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kerveny_koltseg ALTER COLUMN id SET DEFAULT nextval('public.kerveny_koltseg_id_seq'::regclass);


--
-- TOC entry 4674 (class 2604 OID 24761)
-- Name: prices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prices ALTER COLUMN id SET DEFAULT nextval('public.prices_id_seq'::regclass);


--
-- TOC entry 4679 (class 2604 OID 24762)
-- Name: role_audit id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_audit ALTER COLUMN id SET DEFAULT nextval('public.role_audit_id_seq'::regclass);


--
-- TOC entry 4681 (class 2604 OID 24763)
-- Name: statusz id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.statusz ALTER COLUMN id SET DEFAULT nextval('public.statusz_id_seq'::regclass);


--
-- TOC entry 4686 (class 2604 OID 24764)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 4862 (class 0 OID 24705)
-- Dependencies: 217
-- Data for Name: kerveny; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kerveny (id, nev, leiras, helyszin, cim, kezdo_datum, veg_datum, kezdo_idopont, veg_idopont, tipus, minosites, sajto, jelleg, programterv, berendezesi_mod, szallasigeny, szallasigeny_letszam, parkolo, parkolo_reszletek, internet, hulladek, hulladek_elszallitas_modja, hulladek_elszallitas_felelos, letszam, email, telefon, oktatastechnika, oktatas_eszkozok, korlatozott_mozgas, korlatozott_mozgas_reszletek, foto, foto_reszletek, cater, catering_tipus, epites, epites_kezdet, epites_veg, epites_vallalkozok, epites_magas, epites_allvany, epites_kezi, epites_gepi, takaritas, takaritas_alatt, villanyszerelo, aramigeny, leg_szennyezes, egyeb_tevekenyseg, vegyi_anyag, vegyi_anyag_leiras, tuzveszelyes_tevekenyseg, tuzveszelyes_tevekenyseg_leiras, dekoracio, dekoracio_leiras, felelos, lakcim, tovabbi_szervezo, tovabbi_telefon, tovabbi_email, tovabbi_neptun, tovabbi_lakcim, megrendelo_nev, megrendelo_cim, megrendelo_ado, megrendelo_telefon, megrendelo_email, portaszolgalat, portaszolgalat_leiras, statusz, koltseg_osszesen) FROM stdin;
7	Egyetemi Sportnap	Hallgatói sportverseny több sportágban	Egyetemi Sportcsarnok	9026 Győr, Egyetem tér 1.	2025-04-21 00:00:00	2025-02-27 00:00:00	10:00:00	18:00:00	Egyetemi szervezésű sportrendezvény	Zártkörű	\N	sportverseny	Megnyitó, csapatversenyek, egyéni versenyek, eredményhirdetés	Versenyállomások, bírói asztalok	\N	\N	\N	Kb. 30 parkolóhely szükséges	\N	\N	egyetem	\N	200	sport@sze.hu	+36309876543	\N	\N	\N	Akadálymentes megközelítés biztosított	\N	Sport fotózás, videókészítés	\N	"[\\"hideg étel\\",\\"kávé, tea, üdítő\\"]"	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	nem szükséges	\N	egyik sem várható	\N	\N	\N	\N	\N	\N	Egyetemi zászlók, molinók	Kovács Tamás	9024 Győr, Ikva utca 8.	\N	\N	\N	\N	\N	Széchenyi Egyetem Sportegyesület	9026 Győr, Egyetem tér 1.	18308344-2-41	+3696503450	sport@sze.hu	\N	Teljes időtartam alatt	SZERZODES_ALAIRVA	\N
11	asdasdasdasdsa	dasdasdasd	dasdsad	9026 Győr Egyetem tér 1	2025-04-17 00:00:00	2025-04-18 00:00:00	20:48:00	21:49:00	Egyetemi szervezésű hallgatói rendezvény	Nyilvános	f	adasdas	dsadsa	dsadasad	f	\N	f	\N	f	f	\N	\N	20	example@gmail.com	+36 20 123 4567	f	\N	f	\N	f	\N	f	[]	f	\N	\N	\N	\N	\N	\N	\N	f	f	rendezvény közben	false	páraképződés	\N	f	\N	f	\N	f	\N	adsad	1061 Budapest, Andrássy út 1.	\N	\N	\N	\N	\N	adasdas	1061 Budapest, Andrássy út 1.	12345678-1-23	+36 20 123 4567	pelda@email.hu	f	\N	UF_TIG_JOVAHAGYASRA_VAR	\N
10	asdasdasdasdsa	dasdasdasd	dasdsad	9026 Győr Egyetem tér 1	2025-04-17 00:00:00	2025-04-18 00:00:00	20:48:00	21:49:00	Egyetemi szervezésű hallgatói rendezvény	Nyilvános	f	adasdas	dsadsa	dsadasad	f	\N	f	\N	f	f	\N	\N	20	example@gmail.com	+36 20 123 4567	f	\N	f	\N	f	\N	f	[]	f	\N	\N	\N	\N	\N	\N	\N	f	f	rendezvény közben	false	páraképződés	\N	f	\N	f	\N	f	\N	adsad	1061 Budapest, Andrássy út 1.	\N	\N	\N	\N	\N	adasdas	1061 Budapest, Andrássy út 1.	12345678-1-23	+36 20 123 4567	pelda@email.hu	f	\N	LEZARVA	\N
5	Digitális Átalakulás Konferencia	Digitális transzformáció és innovációs lehetőségek az iparban	Auditorium Maximum	9026 Győr, Egyetem tér 1.	2025-05-15 00:00:00	2025-05-16 00:00:00	09:00:00	17:00:00	Egyetemi szervezésű rendezvény	Nyilvános	t	konferencia	Megnyitó beszéd, szakmai előadások, workshop, kerekasztal beszélgetés, zárszó	Színpad, széksorok, vetítővászon, előadói asztalok	t	15	t	Kb. 50 gépkocsi, egyetemi parkolóban	t	t	egyetem	\N	150	konferencia@sze.hu	+36301234567	t	projektor, laptop, hangosítás, mikrofonok	f	\N	t	professzionális fotós	t	["kávé, tea, üdítő", "hideg étel"]	t	2025-05-14 10:00:00	2025-05-16 19:00:00	Technikai csapat, AV szolgáltató	\N	\N	\N	\N	t	t	rendezvény előtt	igen	egyik sem várható	\N	f	\N	f	\N	t	Roll-up bannerek, virágdekoráció	Dr. Nagy János	9024 Győr, Budai út 5.	igen	+36207654321	nagy.janos@sze.hu	\N	\N	Széchenyi István Egyetem	9026 Győr, Egyetem tér 1.	18308344-2-41	+3696503400	info@sze.hu	t	Teljes nyitvatartás alatt portaszolgálat szükséges	SZERZODES_ALAIRVA	\N
6	Egyetemi Tavaszi Fesztivál	Hallgatói rendezvény koncertekkel, programokkal	Campus szabadtéri terület	9026 Győr, Egyetem tér 1.	2025-04-20 00:00:00	2025-04-22 00:00:00	14:00:00	23:00:00	Egyetemi szervezésű hallgatói rendezvény	Nyilvános	t	fesztivál	Zenei programok, táncbemutatók, versenyek, játékok	Színpad, nézőtér, standok	f	\N	t	Campus és környéki parkolók, kb. 200 autó	t	t	sajat	ABC Hulladékkezelő Kft.	800	fesztival@ehok.sze.hu	+36203456789	f	\N	t	Kerekesszékes bejárat és mosdó biztosítva	t	kamerák, drón	t	["meleg étel", "hideg étel", "kávé, tea, üdítő"]	t	2025-04-19 08:00:00	2025-04-23 12:00:00	XYZ Színpadtechnika, Food Truck szolgáltatók	\N	\N	\N	\N	t	t	rendezvény közben	igen	egyik sem várható	\N	f	\N	t	Tűzijáték, az engedélyek beszerzésre kerültek	t	Fényfüzérek, léggömbök, zászlók	Kiss Péter	9022 Győr, Árpád út 12.	igen	+36701234567	kiss.peter@ehok.sze.hu	\N	\N	Széchenyi Egyetem Hallgatói Önkormányzat	9026 Győr, Egyetem tér 1.	18308344-2-41	+3696503500	ehok@sze.hu	t	Este 22:00 után fokozott portaszolgálat	UF_ARAJANLAT_ELFOGADASARA_VAR	\N
9	asdasdasdasdsa	dasdasdasd	dasdsad	9026 Győr Egyetem tér 1	2025-04-17 00:00:00	2025-04-18 00:00:00	20:48:00	21:49:00	Egyetemi szervezésű hallgatói rendezvény	Nyilvános	f	adasdas	dsadsa	dsadasad	f	\N	f	\N	f	f	\N	\N	20	example@gmail.com	+36 20 123 4567	f	\N	f	\N	f	\N	f	[]	f	\N	\N	\N	\N	\N	\N	\N	f	f	rendezvény közben	false	páraképződés	\N	f	\N	f	\N	f	\N	adsad	1061 Budapest, Andrássy út 1.	\N	\N	\N	\N	\N	adasdas	1061 Budapest, Andrássy út 1.	12345678-1-23	+36 20 123 4567	pelda@email.hu	f	\N	ARAJANLAT_KESZITES_FOLYAMATBAN	\N
12	gfgdfgfdg	fdgdfgdf	gfdgfd	4028 Debrecen Kassai út 26	2025-04-15 00:00:00	2025-04-15 00:00:00	21:29:00	22:30:00	Külső szervezésű sportrendezvény	Nyilvános	f	dasd	asdasdas	dasdadsa	f	\N	f	\N	f	f	\N	\N	30	example@gmail.com	+36 20 123 4567	f	\N	f	\N	f	\N	f	[]	f	\N	\N	\N	\N	\N	\N	\N	f	f	rendezvény közben	false	páraképződés	\N	f	\N	f	\N	f	\N	dsadasdasdasd	1061 Budapest, Andrássy út 1.	\N	\N	\N	\N	\N	adasdas	1061 Budapest, Andrássy út 1.	12345678-1-23	+36 20 123 4567	pelda@email.hu	f	\N	SZERZODES_ALAIRVA	\N
14	John Rendezvény	asdasdsadadasdasdasd	asdasdasasasda	9026 Győr Egyetem tér 1	2025-09-18 00:00:00	2025-09-16 00:00:00	21:22:00	21:22:00	Egyetemi szervezésű sportrendezvény	Nyilvános	t	adwdwadwadawd	dwdawdawdwad	awdawdawdawdaw	t	30	t	szex	t	t	sajat	Pisti	400	example@sze.hu	+36 20 123 4567	f	\N	f	\N	f	\N	f	[]	f	\N	\N	\N	\N	\N	\N	\N	f	f	rendezvény közben	false	füst	\N	f	\N	f	\N	f	\N	Cigány Cigány	1061 Budapest Andrássy út 1	\N	\N	\N	\N	\N	sadsa	1061 Budapest Andrássy út 1	12345678-1-23	+36 20 123 4567	pelda@email.hu	f	\N	UF_ARAJANLAT_ELFOGADASARA_VAR	213520.00
3	szasdasdsadasda	Megváltoztatott leírás	Miklós	qdqwdwdqwdqwd	2025-03-31 00:00:00	2025-04-03 00:00:00	02:31:00	18:52:00	Egyetemi szervezésű rendezvény	Nyilvános	\N	valamivalami	kjosdafpjkdspfoarqa	qewrtgerqgqeg	\N	5	\N	RENDSZAM	\N	\N	sajat	Pisti	30	example@gmail.com	06302345687	\N	LAPTOP	\N	SADAS	\N	GOPRO	\N	"\\"[\\\\\\"kávé, tea, üdítő\\\\\\",\\\\\\"hideg étel\\\\\\"]\\""	\N	2025-12-12 00:00:00	2025-02-14 00:00:00	DOKTOR BÉLA	\N	\N	\N	\N	\N	\N	rendezvény előtt	\N	egyik sem várható	\N	\N	EFGDFGDFG	\N	NEMTOM	\N	LSDFLSDFL	TESZT PISTA	Győr,Egyetem K0	\N	\N	\N	\N	\N	wdqw	qdq	1231232	frwfwrf	akssdkakdasd	\N	WREGWRGWR	UF_ARAJANLATRA_VAR	60000.00
8	AAAAAAAAAAA	Teszt leírás	Szobám	Otthon	2025-04-09 00:00:00	2025-12-12 00:00:00	13:23:00	12:12:00	Egyetemi szervezésű hallgatói rendezvény	Nyilvános	\N	1dqsedq	qdqwdqwdqw	dwqdqwdqw	\N	\N	\N	\N	\N	\N	\N	\N	21	example@gmail.com	06705672345	\N	\N	\N	\N	\N	dasdasd	\N	"[\\"hideg étel\\",\\"meleg étel\\"]"	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	rendezvény előtt	\N	páraképződés	\N	\N	\N	\N	\N	\N	\N	John Doe	Mosonmagyaróvár	\N	\N	\N	\N	\N	inc	Mosonmagyaróvár	102120120	06304563478	example@gmail.com	\N	\N	UF_ARAJANLAT_ELFOGADASARA_VAR	3030000.00
13	valami valami	ASDASDASDASD	sadada	4028 Debrecen Kassai út 26	2025-08-06 00:00:00	2025-08-06 00:00:00	14:24:00	14:24:00	Egyetemi szervezésű hallgatói rendezvény	Nyilvános	\N	Workshop	SZEX	\N	\N	\N	\N	\N	\N	\N	\N	\N	300	asdsadsad@szex.hu	+36 20 123 4567	\N	\N	\N	\N	\N	\N	\N	"[]"	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	nem szükséges	\N	por	\N	\N	\N	\N	\N	\N	\N	szex	1061 Budapest, Andrássy út 1.	\N	\N	\N	\N	\N	asd	1061 Budapest, Andrássy út 1.	12345678-1-23	+36 20 123 4567	pelda@email.hu	\N	\N	UF_ARAJANLATRA_VAR	\N
4	Teszt Rendezveny	\N	Otthonasd	\N	2025-04-05 00:00:00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	UF_ARAJANLAT_ELFOGADASARA_VAR	146000.00
\.


--
-- TOC entry 4864 (class 0 OID 24712)
-- Dependencies: 219
-- Data for Name: kerveny_koltseg; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kerveny_koltseg (id, kerveny_id, service_id, service_name, rate_key, unit, hours, persons, unit_price, line_total, created_at) FROM stdin;
1	3	4	Eseti kültéri takarítás óradíja	priceUniversity	fő/óra	10.00	2.00	3000.00	60000.00	2025-09-16 21:44:03.902702
2	14	6	Eseti gondnoksági feladatok óradíja	priceUniversity	fő/óra	10.00	3.00	3900.00	117000.00	2025-09-16 21:44:48.225531
3	14	3	Eseti recepció/porta óradíja	priceExternal	fő/óra	10.00	2.00	4826.00	96520.00	2025-09-16 21:44:48.225531
4	8	2	Eseti beltéri takarítás óradíja	priceUniversity	fő/óra	1.00	1010.00	3000.00	3030000.00	2025-09-17 00:01:56.296324
7	4	4	Eseti kültéri takarítás óradíja	priceUniversity	fő/óra	1.00	12.00	3000.00	36000.00	2025-09-29 00:15:57.020184
8	4	9	Rendezvénybiztos szolgáltatás díja (rendezvényeken femerülő biztonsági feladatok koordinálása, min. 4 óra)	priceUniversity	fő/óra	10.00	2.00	5500.00	110000.00	2025-09-29 00:15:57.020184
\.


--
-- TOC entry 4866 (class 0 OID 24723)
-- Dependencies: 221
-- Data for Name: prices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prices (id, megnevezes, kategoria, mertekegyseg, ar_egyetem, ar_egyetem_hetvege, ar_kulso, ar_kulso_hetvege, megjegyzes) FROM stdin;
2	Eseti beltéri takarítás óradíja	Általános	fő/óra	3000	3500	3800	4800	
4	Eseti kültéri takarítás óradíja	Általános	fő/óra	3000	3500	3800	4800	
5	Eseti karbantartási feladatok óradíja	Általános	fő/óra	3900	4500	5000	6000	
6	Eseti gondnoksági feladatok óradíja	Általános	fő/óra	3900	4500	5000	6000	
9	Rendezvénybiztos szolgáltatás díja (rendezvényeken femerülő biztonsági feladatok koordinálása, min. 4 óra)	Általános	fő/óra	5500	5500	6000	6000	
10	Rendezvényeken, indokolt esetben egyéb helyszíneken biztonsági személyzet díja (min. 4 óra)	Általános	fő/óra	3500	3500	3900	3900	
11	Zenés-táncos rendezvényeken, indokolt esetben kiemelt helyszíneken biztonsági személyzet díja (min. 4 óra)	Általános	fő/óra	3900	3900	4500	4500	
12	Tűz- munkavédelmi szolgáltatás díja	Általános	fő/óra	8500	8500	11000	11000	
3	Eseti recepció/porta óradíja	Általános	fő/óra	3000	3000	3800	3800	
13	Biztonságtechnikai szolgáltatás díja	Általános	fő/óra	8000	8000	10000	10000	
8	Rendezvény biztonságszervezés, biztonsági dokumentáció díja, általános helyszín	Általános	\N	50000	50000	70000	70000	
7	Rendezvény biztonságszervezés, biztonsági dokumentáció díja, kiemelt helyszín	Általános	\N	85000	85000	110000	110000	
18	MC 001 és 002 bérleti díja	Egyetemi	nap	10000	12000	15000	18000	\N
17	ÚT 114 terem bérleti díja	Egyetemi	nap	10000	12000	15000	18000	\N
16	ÚT aula bérleti díja	Egyetemi	nap	10000	12000	15000	18000	\N
15	Győr Városi Egyetemi Csarnok takarítás 	Egyetemi	alkalom	40000	60000	45000	65000	\N
14	Győr városi Egyetemi Csarnok bérleti díja	Egyetemi	nap	80000	80000	100000	100000	\N
23	Műszaki ügyelet	Egyetemi	fő/óra	10000	12000	15000	18000	\N
22	Takarítás	Egyetemi	fő/óra	10000	12000	15000	18000	\N
21	MC 227 és 228 bérleti díja	Egyetemi	nap	10000	12000	15000	18000	\N
20	MC 122 és 123 bérleti díja	Egyetemi	nap	10000	12000	15000	18000	\N
19	MC 121 bérleti díja	Egyetemi	nap	10000	12000	15000	18000	\N
27	Biztonsági terv, bejelentéshez szükséges dokumentáció elkészítése	Egyetemi	alkalom	10000	12000	15000	18000	\N
26	Portaszolgálat	Egyetemi	óra	10000	12000	15000	18000	\N
25	Rendezvénybiztos	Egyetemi	óra	10000	12000	15000	18000	\N
24	Biztonsági személyzet	Egyetemi	fő/óra	10000	12000	15000	18000	\N
31	Szemétszállítás - Konténer	Egyetemi	db	10000	12000	15000	18000	\N
30	Székek bérlése	Egyetemi	db/alkalom	10000	12000	15000	18000	\N
29	Háló leszedése alpintechnikával	Egyetemi	alkalom	10000	12000	15000	18000	\N
28	Csarnok szőnyegezése	Egyetemi	alkalom	10000	12000	15000	18000	\N
\.


--
-- TOC entry 4868 (class 0 OID 24733)
-- Dependencies: 223
-- Data for Name: role_audit; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_audit (id, user_id, neptun_code, old_role, new_role, changed_by, reason, changed_at) FROM stdin;
1	5	DA44ZT	Uni-Famulus	Főadmin	\N	\N	2025-09-05 00:46:38.147891+02
2	5	DA44ZT	Főadmin	Főadmin	\N	\N	2025-09-05 03:19:11.04369+02
3	1	C5YIYQ	Uni-Famulus	Főadmin	\N	\N	2025-09-05 12:14:12.57559+02
4	1	C5YIYQ	Főadmin	Uni-Famulus	\N	\N	2025-09-05 12:14:20.207104+02
5	5	DA44ZT	Főadmin	Admin	\N	\N	2025-09-16 21:59:45.42193+02
6	1	C5YIYQ	Uni-Famulus	Főadmin	\N	\N	2025-09-16 23:13:22.461817+02
7	1	C5YIYQ	Főadmin	Uni-Famulus	\N	\N	2025-09-16 23:13:52.790117+02
8	13	ENPL82	Uni-Famulus	Admin	\N	\N	2025-09-28 22:34:27.837426+02
\.


--
-- TOC entry 4870 (class 0 OID 24740)
-- Dependencies: 225
-- Data for Name: statusz; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.statusz (id, code, label, phase, terminal, sort_order, active, created_at, updated_at) FROM stdin;
1	ARAJANLAT_KESZITES_FOLYAMATBAN	Árajánlat készítés folyamatban	BEERKEZETT	f	10	t	2025-09-09 02:09:29.123091+02	2025-09-09 02:09:29.123091+02
2	UF_ARAJANLATRA_VAR	UF Árajánlatra vár	BEERKEZETT	f	20	t	2025-09-09 02:09:29.123091+02	2025-09-09 02:09:29.123091+02
3	UF_ARAJANLAT_ELFOGADASARA_VAR	UF Árajánlat elfogadására vár	BEERKEZETT	f	30	t	2025-09-09 02:09:29.123091+02	2025-09-09 02:09:29.123091+02
4	ARAJANLAT_KESZITESERE_VAR	Árajánlat készítésére vár	BEERKEZETT	f	40	t	2025-09-09 02:09:29.123091+02	2025-09-09 02:09:29.123091+02
5	ARAJANLAT_ELFOGADASRA_VAR	Árajánlat elfogadásra vár	BEERKEZETT	f	50	t	2025-09-09 02:09:29.123091+02	2025-09-09 02:09:29.123091+02
6	SZERZODES_ADATOKRA_VAR	Szerződés adatokra vár	SZERZODES	f	110	t	2025-09-09 02:09:29.123091+02	2025-09-09 02:09:29.123091+02
7	SZERZODES_ATNEZESRE_VAR	Szerződés átnézésre vár	SZERZODES	f	120	t	2025-09-09 02:09:29.123091+02	2025-09-09 02:09:29.123091+02
8	SZERZODES_KIKULDESRE_VAR	Szerződés kiküldésre vár	SZERZODES	f	130	t	2025-09-09 02:09:29.123091+02	2025-09-09 02:09:29.123091+02
9	SZERZODES_PARTNERI_ALAIRASRA_VAR	Partneri aláírásra vár	SZERZODES	f	140	t	2025-09-09 02:09:29.123091+02	2025-09-09 02:09:29.123091+02
10	SZERZODES_EGYETEMI_ALAIRASRA_VAR	Egyetemi aláírásra vár	SZERZODES	f	150	t	2025-09-09 02:09:29.123091+02	2025-09-09 02:09:29.123091+02
11	SZERZODES_ALAIRVA	Szerződés aláírva	SZERZODES	f	160	t	2025-09-09 02:09:29.123091+02	2025-09-09 02:09:29.123091+02
12	MEGVALOSITASRA_VAR	Megvalósításra vár	MEGVALOSITAS	f	210	t	2025-09-09 02:09:29.123091+02	2025-09-09 02:09:29.123091+02
13	MEGVALOSULT_UF_IGAZOLASRA_VAR	Megvalósult - UF igazolásra vár	MEGVALOSITAS	f	220	t	2025-09-09 02:09:29.123091+02	2025-09-09 02:09:29.123091+02
14	UF_TIG_JOVAHAGYASRA_VAR	UF TIG jóváhagyásra vár	ELSZAMOLAS	f	310	t	2025-09-09 02:09:29.123091+02	2025-09-09 02:09:29.123091+02
15	ADATKOZLO_GENERALASRA_VAR	Adatközlő generálásra vár	ELSZAMOLAS	f	320	t	2025-09-09 02:09:29.123091+02	2025-09-09 02:09:29.123091+02
16	ADATKOZLO_FELKULDVE	Adatközlő felküldve	ELSZAMOLAS	f	330	t	2025-09-09 02:09:29.123091+02	2025-09-09 02:09:29.123091+02
17	LEZARVA	Lezárva	LEZART	t	400	t	2025-09-09 02:09:29.123091+02	2025-09-09 02:09:29.123091+02
18	ELUTASITVA	Elutasítva	LEZART	t	410	t	2025-09-09 02:09:29.123091+02	2025-09-09 02:09:29.123091+02
19	LEMONDVA	Lemondva	LEZART	t	420	t	2025-09-09 02:09:29.123091+02	2025-09-09 02:09:29.123091+02
20	BEERKEZETT	Beérkezett	BEERKEZETT	f	1	t	2025-09-16 21:15:00.114773+02	2025-09-16 21:15:00.114773+02
\.


--
-- TOC entry 4872 (class 0 OID 24748)
-- Dependencies: 227
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, full_name, neptun_code, role, role_assigned_at, is_active, last_login, created_at, updated_at, avatar_url) FROM stdin;
1	souris20013@gmail.com	$2b$10$vkynwDelsRU5c7q7cFdoTe5TqmDqZ6P6g.wGhpx/lhZ1PkDAy/wPy	Haselberger Viktor	C5YIYQ	Uni-Famulus	2025-09-16 23:13:52.786389+02	t	\N	2025-09-05 00:04:03.165597+02	2025-09-17 00:00:59.48677+02	/uploads/anon-1758060059434.jpg
12	asdasd@gmail.com	$2b$10$uojpcoFlyfF7FZHL7iC9Tu4BW.Z.9WQPYfaSFyXnrgGz.0yAnt1MO	valaki valaki	BD46GT	Uni-Famulus	\N	t	\N	2025-09-09 01:47:01.330142+02	2025-09-09 01:47:34.860336+02	/uploads/anon-1757375254816.png
5	example@gmail.com	$2b$10$t7r9607yPdkK/BtEVM6Lp.mD4mTtUjy7XxIvJkdgT.5v9BilH5SD2	John Winchester	DA44ZT	Admin	2025-09-16 21:59:45.417573+02	t	\N	2025-09-05 00:36:50.282286+02	2025-09-16 23:06:39.587214+02	/uploads/anon-1758056799541.png
13	21peti21@gmail.com	$2b$10$YXqiT0xK.Z/S54gaDlByqOL1pKPfl7fSGMtdDSsTBVOTaLp.5rabm	Halász Péter	ENPL82	Admin	2025-09-28 22:34:27.825694+02	t	\N	2025-09-28 22:34:17.162382+02	2025-09-28 22:35:10.672849+02	\N
\.


--
-- TOC entry 4884 (class 0 OID 0)
-- Dependencies: 218
-- Name: kerveny_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.kerveny_id_seq', 14, true);


--
-- TOC entry 4885 (class 0 OID 0)
-- Dependencies: 220
-- Name: kerveny_koltseg_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.kerveny_koltseg_id_seq', 8, true);


--
-- TOC entry 4886 (class 0 OID 0)
-- Dependencies: 222
-- Name: prices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prices_id_seq', 13, true);


--
-- TOC entry 4887 (class 0 OID 0)
-- Dependencies: 224
-- Name: role_audit_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.role_audit_id_seq', 8, true);


--
-- TOC entry 4888 (class 0 OID 0)
-- Dependencies: 226
-- Name: statusz_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.statusz_id_seq', 20, true);


--
-- TOC entry 4889 (class 0 OID 0)
-- Dependencies: 228
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 13, true);


--
-- TOC entry 4697 (class 2606 OID 24766)
-- Name: kerveny_koltseg kerveny_koltseg_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kerveny_koltseg
    ADD CONSTRAINT kerveny_koltseg_pkey PRIMARY KEY (id);


--
-- TOC entry 4694 (class 2606 OID 24768)
-- Name: kerveny kerveny_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kerveny
    ADD CONSTRAINT kerveny_pkey PRIMARY KEY (id);


--
-- TOC entry 4699 (class 2606 OID 24770)
-- Name: prices prices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prices
    ADD CONSTRAINT prices_pkey PRIMARY KEY (id);


--
-- TOC entry 4701 (class 2606 OID 24772)
-- Name: role_audit role_audit_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_audit
    ADD CONSTRAINT role_audit_pkey PRIMARY KEY (id);


--
-- TOC entry 4703 (class 2606 OID 24774)
-- Name: statusz statusz_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.statusz
    ADD CONSTRAINT statusz_code_key UNIQUE (code);


--
-- TOC entry 4705 (class 2606 OID 24776)
-- Name: statusz statusz_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.statusz
    ADD CONSTRAINT statusz_pkey PRIMARY KEY (id);


--
-- TOC entry 4709 (class 2606 OID 24778)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4711 (class 2606 OID 24780)
-- Name: users users_neptun_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_neptun_code_key UNIQUE (neptun_code);


--
-- TOC entry 4713 (class 2606 OID 24782)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4695 (class 1259 OID 24783)
-- Name: idx_kerveny_koltseg_kerveny_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_kerveny_koltseg_kerveny_id ON public.kerveny_koltseg USING btree (kerveny_id);


--
-- TOC entry 4706 (class 1259 OID 24784)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 4707 (class 1259 OID 24785)
-- Name: idx_users_neptun; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_neptun ON public.users USING btree (neptun_code);


--
-- TOC entry 4716 (class 2620 OID 24786)
-- Name: users trg_users_set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_users_set_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- TOC entry 4715 (class 2606 OID 24787)
-- Name: role_audit fk_role_audit_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_audit
    ADD CONSTRAINT fk_role_audit_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4714 (class 2606 OID 24792)
-- Name: kerveny_koltseg kerveny_koltseg_kerveny_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kerveny_koltseg
    ADD CONSTRAINT kerveny_koltseg_kerveny_id_fkey FOREIGN KEY (kerveny_id) REFERENCES public.kerveny(id) ON DELETE CASCADE;


-- Completed on 2025-09-29 01:57:44

--
-- PostgreSQL database dump complete
--

