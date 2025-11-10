--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

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
-- Name: chat_last_seen; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_last_seen (
    user_id character varying(64) NOT NULL,
    kerveny_id bigint NOT NULL,
    last_seen_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.chat_last_seen OWNER TO postgres;

--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_messages (
    id bigint NOT NULL,
    author_id character varying(64) NOT NULL,
    author_name character varying(128) NOT NULL,
    text text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    kerveny_id bigint,
    last_seen_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.chat_messages OWNER TO postgres;

--
-- Name: chat_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.chat_messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.chat_messages_id_seq OWNER TO postgres;

--
-- Name: chat_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.chat_messages_id_seq OWNED BY public.chat_messages.id;


--
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
    koltseg_osszesen numeric(14,2),
    modositasi_indok character varying(500)
);


ALTER TABLE public.kerveny OWNER TO postgres;

--
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
    created_at timestamp without time zone DEFAULT now(),
    pricing_type character varying(10) DEFAULT 'famulus'::character varying NOT NULL,
    occasions numeric(12,2) DEFAULT 0 NOT NULL,
    days numeric(12,2) DEFAULT 0 NOT NULL,
    quantity numeric(12,2) DEFAULT 0 NOT NULL
);


ALTER TABLE public.kerveny_koltseg OWNER TO postgres;

--
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
-- Name: kerveny_koltseg_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.kerveny_koltseg_id_seq OWNED BY public.kerveny_koltseg.id;


--
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
    megjegyzes text,
    afa boolean DEFAULT false NOT NULL
);


ALTER TABLE public.prices OWNER TO postgres;

--
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
-- Name: prices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prices_id_seq OWNED BY public.prices.id;


--
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
-- Name: role_audit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.role_audit_id_seq OWNED BY public.role_audit.id;


--
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
-- Name: statusz_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.statusz_id_seq OWNED BY public.statusz.id;


--
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
    CONSTRAINT users_role_check CHECK (((role)::text = ANY (ARRAY[('Admin'::character varying)::text, ('Főadmin'::character varying)::text, ('Uni-Famulus'::character varying)::text, ('Rendezvényszervező'::character varying)::text])))
);


ALTER TABLE public.users OWNER TO postgres;

--
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
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: chat_messages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages ALTER COLUMN id SET DEFAULT nextval('public.chat_messages_id_seq'::regclass);


--
-- Name: kerveny_koltseg id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kerveny_koltseg ALTER COLUMN id SET DEFAULT nextval('public.kerveny_koltseg_id_seq'::regclass);


--
-- Name: prices id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prices ALTER COLUMN id SET DEFAULT nextval('public.prices_id_seq'::regclass);


--
-- Name: role_audit id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_audit ALTER COLUMN id SET DEFAULT nextval('public.role_audit_id_seq'::regclass);


--
-- Name: statusz id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.statusz ALTER COLUMN id SET DEFAULT nextval('public.statusz_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: chat_last_seen; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chat_last_seen (user_id, kerveny_id, last_seen_at) FROM stdin;
5	8	2025-11-09 20:27:12.242776+01
14	8	2025-11-09 20:27:30.78586+01
5	4	2025-11-09 20:40:22.909592+01
14	4	2025-11-10 15:39:11.51455+01
15	8	2025-11-10 15:46:07.068931+01
15	4	2025-11-10 15:46:15.451961+01
\.


--
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chat_messages (id, author_id, author_name, text, created_at, kerveny_id, last_seen_at) FROM stdin;
13	14	Rendezvény János	Szuper üzenet	2025-11-09 00:50:58.116542	4	2025-11-09 18:36:22.268627+01
15	14	Rendezvény János	te büdös köcsög	2025-11-09 00:52:42.851664	4	2025-11-09 18:36:22.268627+01
18	14	Rendezvény János	damn daniel	2025-11-09 18:51:26.058371	4	2025-11-09 18:51:26.058371+01
19	5	John Winchester	ciganycigany	2025-11-09 20:27:12.237261	8	2025-11-09 20:27:12.237261+01
20	14	Rendezvény János	szopjaki	2025-11-09 20:40:17.882189	4	2025-11-09 20:40:17.882189+01
21	14	Rendezvény János	valami	2025-11-10 15:39:11.505809	4	2025-11-10 15:39:11.505809+01
\.


--
-- Data for Name: kerveny; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kerveny (id, nev, leiras, helyszin, cim, kezdo_datum, veg_datum, kezdo_idopont, veg_idopont, tipus, minosites, sajto, jelleg, programterv, berendezesi_mod, szallasigeny, szallasigeny_letszam, parkolo, parkolo_reszletek, internet, hulladek, hulladek_elszallitas_modja, hulladek_elszallitas_felelos, letszam, email, telefon, oktatastechnika, oktatas_eszkozok, korlatozott_mozgas, korlatozott_mozgas_reszletek, foto, foto_reszletek, cater, catering_tipus, epites, epites_kezdet, epites_veg, epites_vallalkozok, epites_magas, epites_allvany, epites_kezi, epites_gepi, takaritas, takaritas_alatt, villanyszerelo, aramigeny, leg_szennyezes, egyeb_tevekenyseg, vegyi_anyag, vegyi_anyag_leiras, tuzveszelyes_tevekenyseg, tuzveszelyes_tevekenyseg_leiras, dekoracio, dekoracio_leiras, felelos, lakcim, tovabbi_szervezo, tovabbi_telefon, tovabbi_email, tovabbi_neptun, tovabbi_lakcim, megrendelo_nev, megrendelo_cim, megrendelo_ado, megrendelo_telefon, megrendelo_email, portaszolgalat, portaszolgalat_leiras, statusz, koltseg_osszesen, modositasi_indok) FROM stdin;
11	asdasdasdasdsa	dasdasdasd	dasdsad	9026 Győr Egyetem tér 1	2025-04-17 00:00:00	2025-04-18 00:00:00	20:48:00	21:49:00	Egyetemi szervezésű hallgatói rendezvény	Nyilvános	f	adasdas	dsadsa	dsadasad	f	\N	f	\N	f	f	\N	\N	20	example@gmail.com	+36 20 123 4567	f	\N	f	\N	f	\N	f	[]	f	\N	\N	\N	\N	\N	\N	\N	f	f	rendezvény közben	false	páraképződés	\N	f	\N	f	\N	f	\N	adsad	1061 Budapest, Andrássy út 1.	\N	\N	\N	\N	\N	adasdas	1061 Budapest, Andrássy út 1.	12345678-1-23	+36 20 123 4567	pelda@email.hu	f	\N	UF_TIG_JOVAHAGYASRA_VAR	\N	\N
10	asdasdasdasdsa	dasdasdasd	dasdsad	9026 Győr Egyetem tér 1	2025-04-17 00:00:00	2025-04-18 00:00:00	20:48:00	21:49:00	Egyetemi szervezésű hallgatói rendezvény	Nyilvános	f	adasdas	dsadsa	dsadasad	f	\N	f	\N	f	f	\N	\N	20	example@gmail.com	+36 20 123 4567	f	\N	f	\N	f	\N	f	[]	f	\N	\N	\N	\N	\N	\N	\N	f	f	rendezvény közben	false	páraképződés	\N	f	\N	f	\N	f	\N	adsad	1061 Budapest, Andrássy út 1.	\N	\N	\N	\N	\N	adasdas	1061 Budapest, Andrássy út 1.	12345678-1-23	+36 20 123 4567	pelda@email.hu	f	\N	LEZARVA	\N	\N
12	gfgdfgfdg	fdgdfgdf	gfdgfd	4028 Debrecen Kassai út 26	2025-04-15 00:00:00	2025-04-15 00:00:00	21:29:00	22:30:00	Külső szervezésű sportrendezvény	Nyilvános	f	dasd	asdasdas	dasdadsa	f	\N	f	\N	f	f	\N	\N	30	example@gmail.com	+36 20 123 4567	f	\N	f	\N	f	\N	f	[]	f	\N	\N	\N	\N	\N	\N	\N	f	f	rendezvény közben	false	páraképződés	\N	f	\N	f	\N	f	\N	dsadasdasdasd	1061 Budapest, Andrássy út 1.	\N	\N	\N	\N	\N	adasdas	1061 Budapest, Andrássy út 1.	12345678-1-23	+36 20 123 4567	pelda@email.hu	f	\N	SZERZODES_ALAIRVA	\N	\N
8	AAAAAAAAAAA	Teszt leírás	Szobám	Otthon	2025-04-08 00:00:00	2025-12-11 00:00:00	13:23:00	12:12:00	Egyetemi szervezésű hallgatói rendezvény	Nyilvános	\N	1dqsedq	qdqwdqwdqw	dwqdqwdqw	\N	\N	\N	\N	\N	\N	\N	\N	21	souris20013@gmail.com	06705672345	\N	\N	\N	\N	\N	dasdasd	\N	"[\\"hideg étel\\",\\"meleg étel\\"]"	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	rendezvény előtt	\N	páraképződés	\N	\N	\N	\N	\N	\N	\N	John Doe	Mosonmagyaróvár	\N	\N	\N	\N	\N	inc	Mosonmagyaróvár	102120120	06304563478	example@gmail.com	\N	\N	ARAJANLAT_ELFOGADASRA_VAR	997000.00	szopja ki
14	John Rendezvény	asdasdsadadasdasdasd	asdasdasasasda	9026 Győr Egyetem tér 1	2025-09-18 00:00:00	2025-09-16 00:00:00	21:22:00	21:22:00	Egyetemi szervezésű sportrendezvény	Nyilvános	t	adwdwadwadawd	dwdawdawdwad	awdawdawdawdaw	t	30	t	szex	t	t	sajat	Pisti	400	example@sze.hu	+36 20 123 4567	f	\N	f	\N	f	\N	f	[]	f	\N	\N	\N	\N	\N	\N	\N	f	f	rendezvény közben	false	füst	\N	f	\N	f	\N	f	\N	Cigány Cigány	1061 Budapest Andrássy út 1	\N	\N	\N	\N	\N	sadsa	1061 Budapest Andrássy út 1	12345678-1-23	+36 20 123 4567	pelda@email.hu	f	\N	ARAJANLAT_ELFOGADASRA_VAR	2890000.00	\N
3	nevnev	Megváltoztatott leírás	Miklós	qdqwdwdqwdqwd	2025-03-29 00:00:00	2025-04-01 00:00:00	02:31:00	18:52:00	Egyetemi szervezésű rendezvény	Nyilvános	\N	valamivalami	kjosdafpjkdspfoarqa	qewrtgerqgqeg	\N	5	\N	RENDSZAM	\N	\N	sajat	Pisti	30	souris20013@gmail.com	06302345687	\N	LAPTOP	\N	SADAS	\N	GOPRO	\N	"\\"[\\\\\\"kávé, tea, üdítő\\\\\\",\\\\\\"hideg étel\\\\\\"]\\""	\N	2025-12-10 00:00:00	2025-02-12 00:00:00	DOKTOR BÉLA	\N	\N	\N	\N	\N	\N	rendezvény előtt	\N	egyik sem várható	\N	\N	EFGDFGDFG	\N	NEMTOM	\N	LSDFLSDFL	TESZT PISTA	Győr,Egyetem K0	\N	\N	\N	\N	\N	wdqw	qdq	1231232	frwfwrf	akssdkakdasd	\N	WREGWRGWR	LEMONDVA	1300000.00	\N
9	asdasdasdasdsa	dasdasdasd	dasdsad	9026 Győr Egyetem tér 1	2025-04-17 00:00:00	2025-04-18 00:00:00	20:48:00	21:49:00	Egyetemi szervezésű hallgatói rendezvény	Nyilvános	f	adasdas	dsadsa	dsadasad	f	\N	f	\N	f	f	\N	\N	20	example@gmail.com	+36 20 123 4567	f	\N	f	\N	f	\N	f	[]	f	\N	\N	\N	\N	\N	\N	\N	f	f	rendezvény közben	false	páraképződés	\N	f	\N	f	\N	f	\N	adsad	1061 Budapest, Andrássy út 1.	\N	\N	\N	\N	\N	adasdas	1061 Budapest, Andrássy út 1.	12345678-1-23	+36 20 123 4567	pelda@email.hu	f	\N	ARAJANLAT_KESZITESERE_VAR	100000.00	Nem tetszik
7	Egyetemi Sportnap	Hallgatói sportverseny több sportágban	Egyetemi Sportcsarnok	9026 Győr, Egyetem tér 1.	2025-04-21 00:00:00	2025-02-27 00:00:00	10:00:00	18:00:00	Egyetemi szervezésű sportrendezvény	Zártkörű	\N	sportverseny	Megnyitó, csapatversenyek, egyéni versenyek, eredményhirdetés	Versenyállomások, bírói asztalok	\N	\N	\N	Kb. 30 parkolóhely szükséges	\N	\N	egyetem	\N	200	sport@sze.hu	+36309876543	\N	\N	\N	Akadálymentes megközelítés biztosított	\N	Sport fotózás, videókészítés	\N	"[\\"hideg étel\\",\\"kávé, tea, üdítő\\"]"	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	nem szükséges	\N	egyik sem várható	\N	\N	\N	\N	\N	\N	Egyetemi zászlók, molinók	Kovács Tamás	9024 Győr, Ikva utca 8.	\N	\N	\N	\N	\N	Széchenyi Egyetem Sportegyesület	9026 Győr, Egyetem tér 1.	18308344-2-41	+3696503450	sport@sze.hu	\N	Teljes időtartam alatt	UF_ARAJANLAT_ELFOGADASARA_VAR	890000.00	Túl sok
13	valami valami	ASDASDASDASD	sadada	4028 Debrecen Kassai út 26	2025-08-06 00:00:00	2025-08-06 00:00:00	14:24:00	14:24:00	Egyetemi szervezésű hallgatói rendezvény	Nyilvános	\N	Workshop	SZEX	\N	\N	\N	\N	\N	\N	\N	\N	\N	300	asdsadsad@szex.hu	+36 20 123 4567	\N	\N	\N	\N	\N	\N	\N	"[]"	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	nem szükséges	\N	por	\N	\N	\N	\N	\N	\N	\N	szex	1061 Budapest, Andrássy út 1.	\N	\N	\N	\N	\N	asd	1061 Budapest, Andrássy út 1.	12345678-1-23	+36 20 123 4567	pelda@email.hu	\N	\N	ARAJANLAT_KESZITESERE_VAR	390000.00	\N
6	Egyetemi Tavaszi Fesztivál	Hallgatói rendezvény koncertekkel, programokkal	Campus szabadtéri terület	9026 Győr, Egyetem tér 1.	2025-04-20 00:00:00	2025-04-22 00:00:00	14:00:00	23:00:00	Egyetemi szervezésű hallgatói rendezvény	Nyilvános	t	fesztivál	Zenei programok, táncbemutatók, versenyek, játékok	Színpad, nézőtér, standok	f	\N	t	Campus és környéki parkolók, kb. 200 autó	t	t	sajat	ABC Hulladékkezelő Kft.	800	fesztival@ehok.sze.hu	+36203456789	f	\N	t	Kerekesszékes bejárat és mosdó biztosítva	t	kamerák, drón	t	["meleg étel", "hideg étel", "kávé, tea, üdítő"]	t	2025-04-19 08:00:00	2025-04-23 12:00:00	XYZ Színpadtechnika, Food Truck szolgáltatók	\N	\N	\N	\N	t	t	rendezvény közben	igen	egyik sem várható	\N	f	\N	t	Tűzijáték, az engedélyek beszerzésre kerültek	t	Fényfüzérek, léggömbök, zászlók	Kiss Péter	9022 Győr, Árpád út 12.	igen	+36701234567	kiss.peter@ehok.sze.hu	\N	\N	Széchenyi Egyetem Hallgatói Önkormányzat	9026 Győr, Egyetem tér 1.	18308344-2-41	+3696503500	ehok@sze.hu	t	Este 22:00 után fokozott portaszolgálat	UF_ARAJANLAT_ELFOGADASARA_VAR	93000.00	Nem jo
5	Digitális Átalakulás Konferencib	Digitális transzformáció és innovációs lehetőségek az iparban	Auditorium Maximum	9026 Győr, Egyetem tér 1.	2025-05-12 00:00:00	2025-05-13 00:00:00	09:00:00	17:00:00	Egyetemi szervezésű rendezvény	Nyilvános	\N	konferencia	Megnyitó beszéd, szakmai előadások, workshop, kerekasztal beszélgetés, zárszó	Színpad, széksorok, vetítővászon, előadói asztalok	\N	15	\N	Kb. 50 gépkocsi, egyetemi parkolóban	\N	\N	egyetem	\N	150	souris20013@gmail.com	+36301234567	\N	projektor, laptop, hangosítás, mikrofonok	\N	\N	\N	professzionális fotós	\N	"[\\"kávé, tea, üdítő\\",\\"hideg étel\\"]"	\N	2025-05-12 00:00:00	2025-05-14 00:00:00	Technikai csapat, AV szolgáltató	\N	\N	\N	\N	\N	\N	rendezvény előtt	\N	egyik sem várható	\N	\N	\N	\N	\N	\N	Roll-up bannerek, virágdekoráció	Dr. Nagy János	9024 Győr, Budai út 5.	\N	+36207654321	nagy.janos@sze.hu	\N	\N	Széchenyi István Egyetem	9026 Győr, Egyetem tér 1.	18308344-2-41	+3696503400	info@sze.hu	\N	Teljes nyitvatartás alatt portaszolgálat szükséges	BEERKEZETT	940000.00	\N
4	Teszt Rendezveny	\N	Otthonasd	\N	2025-04-05 00:00:00	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	UF_ARAJANLATRA_VAR	1014625.00	imni9kmi
\.


--
-- Data for Name: kerveny_koltseg; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.kerveny_koltseg (id, kerveny_id, service_id, service_name, rate_key, unit, hours, persons, unit_price, line_total, created_at, pricing_type, occasions, days, quantity) FROM stdin;
13	3	\N	\N	priceUniversity	\N	0.00	0.00	0.00	0.00	2025-10-01 09:54:07.402246	famulus	0.00	0.00	0.00
23	7	18	MC 001 és 002 bérleti díja	priceUniversity	nap	0.00	0.00	10000.00	50000.00	2025-10-07 16:49:20.401352	famulus	0.00	5.00	0.00
29	3	29	Háló leszedése alpintechnikával	priceUniversity	alkalom	0.00	0.00	10000.00	100000.00	2025-10-15 17:53:55.306954	famulus	10.00	0.00	0.00
30	3	30	Székek bérlése	priceUniversity	db/alkalom	0.00	0.00	10000.00	1000000.00	2025-10-15 17:53:55.306954	famulus	10.00	0.00	10.00
31	3	26	Portaszolgálat	priceUniversity	óra	10.00	0.00	10000.00	100000.00	2025-10-15 17:53:55.306954	famulus	0.00	0.00	0.00
32	3	18	MC 001 és 002 bérleti díja	priceUniversity	nap	0.00	0.00	10000.00	100000.00	2025-10-15 17:53:55.306954	famulus	0.00	10.00	0.00
116	9	29	Háló leszedése alpintechnikával	priceUniversity	alkalom	0.00	0.00	10000.00	100000.00	2025-11-05 19:45:06.984745	famulus	10.00	0.00	0.00
40	6	29	Háló leszedése alpintechnikával	priceUniversity	alkalom	0.00	0.00	10000.00	40000.00	2025-10-15 19:01:41.910539	famulus	4.00	0.00	0.00
41	6	22	Takarítás	priceUniversity	fő/óra	2.00	2.00	10000.00	40000.00	2025-10-15 19:01:41.910539	famulus	0.00	0.00	0.00
42	6	19	MC 121 bérleti díja	priceUniversity	nap	0.00	0.00	10000.00	10000.00	2025-10-15 19:01:41.910539	famulus	0.00	1.00	0.00
43	14	6	Eseti gondnoksági feladatok óradíja	priceUniversity	fő/óra	10.00	10.00	3900.00	390000.00	2025-10-15 19:41:43.611159	famulus	0.00	0.00	0.00
44	14	10	Rendezvényeken, indokolt esetben egyéb helyszíneken biztonsági személyzet díja (min. 4 óra)	priceUniversity	fő/óra	10.00	10.00	3500.00	350000.00	2025-10-15 19:41:43.611159	famulus	0.00	0.00	0.00
45	14	13	Biztonságtechnikai szolgáltatás díja	priceExternalWeekend	fő/óra	10.00	10.00	10000.00	1000000.00	2025-10-15 19:41:43.611159	famulus	0.00	0.00	0.00
46	14	30	Székek bérlése	priceUniversity	db/alkalom	0.00	0.00	10000.00	560000.00	2025-10-15 19:43:07.42346	famulus	7.00	0.00	8.00
47	14	15	Győr Városi Egyetemi Csarnok takarítás	priceUniversity	alkalom	0.00	0.00	40000.00	400000.00	2025-10-15 19:43:07.42346	famulus	10.00	0.00	0.00
48	14	27	Biztonsági terv, bejelentéshez szükséges dokumentáció elkészítése	priceUniversity	alkalom	0.00	0.00	10000.00	100000.00	2025-10-15 19:43:07.42346	famulus	10.00	0.00	0.00
49	14	18	MC 001 és 002 bérleti díja	priceUniversity	nap	0.00	0.00	10000.00	90000.00	2025-10-15 19:43:07.42346	famulus	0.00	9.00	0.00
122	6	4	Eseti kültéri takarítás óradíja	priceUniversity	fő/óra	1.00	1.00	3000.00	3000.00	2025-11-05 20:47:15.581246	famulus	0.00	0.00	0.00
57	13	6	Eseti gondnoksági feladatok óradíja	priceUniversity	fő/óra	10.00	10.00	3900.00	390000.00	2025-10-15 21:22:32.293547	famulus	0.00	0.00	0.00
127	7	5	Eseti karbantartási feladatok óradíja	priceUniversity	fő/óra	10.00	10.00	3900.00	390000.00	2025-11-05 21:31:28.401211	famulus	0.00	0.00	0.00
128	7	5	Eseti karbantartási feladatok óradíja	priceUniversityWeekend	fő/óra	10.00	10.00	4500.00	450000.00	2025-11-05 21:31:28.401211	famulus	0.00	0.00	0.00
64	5	10	Rendezvényeken, indokolt esetben egyéb helyszíneken biztonsági személyzet díja (min. 4 óra)	priceUniversity	fő/óra	10.00	10.00	3500.00	350000.00	2025-10-15 21:48:31.649121	famulus	0.00	0.00	0.00
65	5	10	Rendezvényeken, indokolt esetben egyéb helyszíneken biztonsági személyzet díja (min. 4 óra)	priceExternal	fő/óra	10.00	10.00	3900.00	390000.00	2025-10-15 21:48:31.649121	famulus	0.00	0.00	0.00
66	5	26	Portaszolgálat	priceUniversity	óra	10.00	0.00	10000.00	100000.00	2025-10-15 21:48:40.084332	famulus	0.00	0.00	0.00
67	5	18	MC 001 és 002 bérleti díja	priceUniversity	nap	0.00	0.00	10000.00	100000.00	2025-10-15 21:48:40.084332	famulus	0.00	10.00	0.00
131	8	10	Rendezvényeken, indokolt esetben egyéb helyszíneken biztonsági személyzet díja (min. 4 óra)	priceUniversity	fő/óra	21.00	2.00	3500.00	147000.00	2025-11-09 19:54:15.99168	famulus	0.00	0.00	0.00
132	8	9	Rendezvénybiztos szolgáltatás díja (rendezvényeken femerülő biztonsági feladatok koordinálása, min. 4 óra)	priceUniversity	fő/óra	10.00	10.00	5500.00	550000.00	2025-11-09 19:54:15.99168	famulus	0.00	0.00	0.00
142	8	29	Háló leszedése alpintechnikával	priceUniversity	alkalom	0.00	0.00	10000.00	100000.00	2025-11-09 20:26:56.815337	famulus	10.00	0.00	0.00
143	8	29	Háló leszedése alpintechnikával	priceUniversity	alkalom	0.00	0.00	10000.00	100000.00	2025-11-09 20:26:56.815337	famulus	10.00	0.00	0.00
144	8	27	Biztonsági terv, bejelentéshez szükséges dokumentáció elkészítése	priceUniversity	alkalom	0.00	0.00	10000.00	100000.00	2025-11-09 20:26:56.815337	famulus	10.00	0.00	0.00
146	4	30	Székek bérlése	priceUniversity	db/alkalom	10.00	10.00	10000.00	1000000.00	2025-11-09 20:37:47.370058	famulus	10.00	0.00	10.00
147	4	5	Eseti karbantartási feladatok óradíja	priceUniversity	fő/óra	0.75	5.00	3900.00	14625.00	2025-11-10 15:36:27.629202	famulus	0.00	0.00	0.00
\.


--
-- Data for Name: prices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prices (id, megnevezes, kategoria, mertekegyseg, ar_egyetem, ar_egyetem_hetvege, ar_kulso, ar_kulso_hetvege, megjegyzes, afa) FROM stdin;
17	ÚT 114 terem bérleti díja	Egyetemi	nap	10000	12000	15000	18000	\N	f
16	ÚT aula bérleti díja	Egyetemi	nap	10000	12000	15000	18000	\N	f
14	Győr városi Egyetemi Csarnok bérleti díja	Egyetemi	nap	80000	80000	100000	100000	\N	f
21	MC 227 és 228 bérleti díja	Egyetemi	nap	10000	12000	15000	18000	\N	f
20	MC 122 és 123 bérleti díja	Egyetemi	nap	10000	12000	15000	18000	\N	f
19	MC 121 bérleti díja	Egyetemi	nap	10000	12000	15000	18000	\N	f
2	Eseti beltéri takarítás óradíja	UF	fő/óra	3000	3500	3800	4800		f
4	Eseti kültéri takarítás óradíja	UF	fő/óra	3000	3500	3800	4800		f
5	Eseti karbantartási feladatok óradíja	UF	fő/óra	3900	4500	5000	6000		f
6	Eseti gondnoksági feladatok óradíja	UF	fő/óra	3900	4500	5000	6000		f
9	Rendezvénybiztos szolgáltatás díja (rendezvényeken femerülő biztonsági feladatok koordinálása, min. 4 óra)	UF	fő/óra	5500	5500	6000	6000		f
10	Rendezvényeken, indokolt esetben egyéb helyszíneken biztonsági személyzet díja (min. 4 óra)	UF	fő/óra	3500	3500	3900	3900		f
11	Zenés-táncos rendezvényeken, indokolt esetben kiemelt helyszíneken biztonsági személyzet díja (min. 4 óra)	UF	fő/óra	3900	3900	4500	4500		f
12	Tűz- munkavédelmi szolgáltatás díja	UF	fő/óra	8500	8500	11000	11000		f
3	Eseti recepció/porta óradíja	UF	fő/óra	3000	3000	3800	3800		f
13	Biztonságtechnikai szolgáltatás díja	UF	fő/óra	8000	8000	10000	10000		f
8	Rendezvény biztonságszervezés, biztonsági dokumentáció díja, általános helyszín	UF	\N	50000	50000	70000	70000		f
7	Rendezvény biztonságszervezés, biztonsági dokumentáció díja, kiemelt helyszín	UF	\N	85000	85000	110000	110000		f
18	MC 001 és 002 bérleti díja	Egyetemi	nap	10000	12000	15000	18000		f
15	Győr Városi Egyetemi Csarnok takarítás	Egyetemi	alkalom	40000	60000	45000	65000		t
22	Takarítás	Egyetemi	fő/óra	10000	12000	15000	18000		t
23	Műszaki ügyelet	Egyetemi	fő/óra	10000	12000	15000	18000		t
25	Rendezvénybiztos	Egyetemi	óra	10000	12000	15000	18000		t
24	Biztonsági személyzet	Egyetemi	fő/óra	10000	12000	15000	18000		t
26	Portaszolgálat	Egyetemi	óra	10000	12000	15000	18000		t
27	Biztonsági terv, bejelentéshez szükséges dokumentáció elkészítése	Egyetemi	alkalom	10000	12000	15000	18000		t
28	Csarnok szőnyegezése	Egyetemi	alkalom	10000	12000	15000	18000		t
29	Háló leszedése alpintechnikával	Egyetemi	alkalom	10000	12000	15000	18000		t
30	Székek bérlése	Egyetemi	db/alkalom	10000	12000	15000	18000		t
31	Szemétszállítás - Konténer	Egyetemi	db	10000	12000	15000	18000		t
\.


--
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
9	14	ABCD12	Uni-Famulus	Rendezvényszervező	\N	\N	2025-11-04 21:35:02.32268+01
10	14	ABCD12	Rendezvényszervező	Rendezvényszervező	\N	\N	2025-11-05 19:59:17.969091+01
\.


--
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
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password_hash, full_name, neptun_code, role, role_assigned_at, is_active, last_login, created_at, updated_at, avatar_url) FROM stdin;
12	asdasd@gmail.com	$2b$10$uojpcoFlyfF7FZHL7iC9Tu4BW.Z.9WQPYfaSFyXnrgGz.0yAnt1MO	valaki valaki	BD46GT	Uni-Famulus	\N	t	\N	2025-09-09 01:47:01.330142+02	2025-09-09 01:47:34.860336+02	/uploads/anon-1757375254816.png
5	example@gmail.com	$2b$10$t7r9607yPdkK/BtEVM6Lp.mD4mTtUjy7XxIvJkdgT.5v9BilH5SD2	John Winchester	DA44ZT	Admin	2025-09-16 21:59:45.417573+02	t	\N	2025-09-05 00:36:50.282286+02	2025-09-16 23:06:39.587214+02	/uploads/anon-1758056799541.png
13	21peti21@gmail.com	$2b$10$YXqiT0xK.Z/S54gaDlByqOL1pKPfl7fSGMtdDSsTBVOTaLp.5rabm	Halász Péter	ENPL82	Admin	2025-09-28 22:34:27.825694+02	t	\N	2025-09-28 22:34:17.162382+02	2025-09-28 22:35:10.672849+02	\N
1	souris20013@gmail.com	$2b$10$vkynwDelsRU5c7q7cFdoTe5TqmDqZ6P6g.wGhpx/lhZ1PkDAy/wPy	Haselberger Viktor	C5YIYQ	Uni-Famulus	2025-09-16 23:13:52.786389+02	t	\N	2025-09-05 00:04:03.165597+02	2025-11-04 22:01:40.282425+01	/uploads/anon-1762290100141.png
14	email@example.com	$2b$10$JQE1ZabQSL4/DJkwKO2Yk.1xADvTrCl0lonezwpSMr5yh8u4pnAnm	Rendezvény János	ABCD12	Rendezvényszervező	2025-11-05 19:59:17.935965+01	t	\N	2025-11-04 21:22:53.595375+01	2025-11-05 19:59:27.018403+01	/uploads/anon-1762290061150.jpg
15	kishujbi@gmail.com	$2b$10$CVEUF3AHAvOQ2mjmx3lDnuIcBR57A.b7Vbkh/TnNSvVyxSZTDikBO	Hujber Patrik	DCDG6G	Admin	\N	t	\N	2025-11-10 15:35:07.466081+01	2025-11-10 15:45:17.186421+01	\N
\.


--
-- Name: chat_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.chat_messages_id_seq', 21, true);


--
-- Name: kerveny_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.kerveny_id_seq', 14, true);


--
-- Name: kerveny_koltseg_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.kerveny_koltseg_id_seq', 147, true);


--
-- Name: prices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prices_id_seq', 13, true);


--
-- Name: role_audit_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.role_audit_id_seq', 10, true);


--
-- Name: statusz_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.statusz_id_seq', 20, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 15, true);


--
-- Name: chat_last_seen chat_last_seen_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_last_seen
    ADD CONSTRAINT chat_last_seen_pkey PRIMARY KEY (user_id, kerveny_id);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: kerveny_koltseg kerveny_koltseg_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kerveny_koltseg
    ADD CONSTRAINT kerveny_koltseg_pkey PRIMARY KEY (id);


--
-- Name: kerveny kerveny_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kerveny
    ADD CONSTRAINT kerveny_pkey PRIMARY KEY (id);


--
-- Name: prices prices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prices
    ADD CONSTRAINT prices_pkey PRIMARY KEY (id);


--
-- Name: role_audit role_audit_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_audit
    ADD CONSTRAINT role_audit_pkey PRIMARY KEY (id);


--
-- Name: statusz statusz_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.statusz
    ADD CONSTRAINT statusz_code_key UNIQUE (code);


--
-- Name: statusz statusz_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.statusz
    ADD CONSTRAINT statusz_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_neptun_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_neptun_code_key UNIQUE (neptun_code);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_chat_last_seen_kerveny; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chat_last_seen_kerveny ON public.chat_last_seen USING btree (kerveny_id);


--
-- Name: idx_chat_messages_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chat_messages_created_at ON public.chat_messages USING btree (created_at);


--
-- Name: idx_chat_messages_kerveny_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chat_messages_kerveny_id ON public.chat_messages USING btree (kerveny_id);


--
-- Name: idx_kerveny_koltseg_kerveny_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_kerveny_koltseg_kerveny_id ON public.kerveny_koltseg USING btree (kerveny_id);


--
-- Name: idx_koltseg_kerveny_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_koltseg_kerveny_type ON public.kerveny_koltseg USING btree (kerveny_id, pricing_type);


--
-- Name: idx_koltseg_service_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_koltseg_service_id ON public.kerveny_koltseg USING btree (service_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_neptun; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_neptun ON public.users USING btree (neptun_code);


--
-- Name: users trg_users_set_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_users_set_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: chat_messages fk_chat_messages_kerveny; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT fk_chat_messages_kerveny FOREIGN KEY (kerveny_id) REFERENCES public.kerveny(id) ON DELETE CASCADE;


--
-- Name: role_audit fk_role_audit_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_audit
    ADD CONSTRAINT fk_role_audit_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: kerveny_koltseg kerveny_koltseg_kerveny_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kerveny_koltseg
    ADD CONSTRAINT kerveny_koltseg_kerveny_id_fkey FOREIGN KEY (kerveny_id) REFERENCES public.kerveny(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

