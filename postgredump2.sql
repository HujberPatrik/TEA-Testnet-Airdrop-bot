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
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: kerveny; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: kerveny_id_seq; Type: SEQUENCE; Schema: public; Owner: -
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
-- Name: kerveny_koltseg; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: kerveny_koltseg_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.kerveny_koltseg_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: kerveny_koltseg_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.kerveny_koltseg_id_seq OWNED BY public.kerveny_koltseg.id;


--
-- Name: prices; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: prices_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.prices_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: prices_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.prices_id_seq OWNED BY public.prices.id;


--
-- Name: role_audit; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: role_audit_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.role_audit_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: role_audit_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.role_audit_id_seq OWNED BY public.role_audit.id;


--
-- Name: statusz; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: statusz_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.statusz_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: statusz_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.statusz_id_seq OWNED BY public.statusz.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
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
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['Admin'::character varying, 'Főadmin'::character varying, 'Uni-Famulus'::character varying, 'Rendezvényszervező'::character varying])::text[])))
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: kerveny_koltseg id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kerveny_koltseg ALTER COLUMN id SET DEFAULT nextval('public.kerveny_koltseg_id_seq'::regclass);


--
-- Name: prices id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prices ALTER COLUMN id SET DEFAULT nextval('public.prices_id_seq'::regclass);


--
-- Name: role_audit id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_audit ALTER COLUMN id SET DEFAULT nextval('public.role_audit_id_seq'::regclass);


--
-- Name: statusz id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.statusz ALTER COLUMN id SET DEFAULT nextval('public.statusz_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: kerveny; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.kerveny (id, nev, leiras, helyszin, cim, kezdo_datum, veg_datum, kezdo_idopont, veg_idopont, tipus, minosites, sajto, jelleg, programterv, berendezesi_mod, szallasigeny, szallasigeny_letszam, parkolo, parkolo_reszletek, internet, hulladek, hulladek_elszallitas_modja, hulladek_elszallitas_felelos, letszam, email, telefon, oktatastechnika, oktatas_eszkozok, korlatozott_mozgas, korlatozott_mozgas_reszletek, foto, foto_reszletek, cater, catering_tipus, epites, epites_kezdet, epites_veg, epites_vallalkozok, epites_magas, epites_allvany, epites_kezi, epites_gepi, takaritas, takaritas_alatt, villanyszerelo, aramigeny, leg_szennyezes, egyeb_tevekenyseg, vegyi_anyag, vegyi_anyag_leiras, tuzveszelyes_tevekenyseg, tuzveszelyes_tevekenyseg_leiras, dekoracio, dekoracio_leiras, felelos, lakcim, tovabbi_szervezo, tovabbi_telefon, tovabbi_email, tovabbi_neptun, tovabbi_lakcim, megrendelo_nev, megrendelo_cim, megrendelo_ado, megrendelo_telefon, megrendelo_email, portaszolgalat, portaszolgalat_leiras, statusz, koltseg_osszesen, modositasi_indok) OVERRIDING SYSTEM VALUE VALUES (11, 'asdasdasdasdsa', 'dasdasdasd', 'dasdsad', '9026 Győr Egyetem tér 1', '2025-04-17 00:00:00', '2025-04-18 00:00:00', '20:48:00', '21:49:00', 'Egyetemi szervezésű hallgatói rendezvény', 'Nyilvános', false, 'adasdas', 'dsadsa', 'dsadasad', false, NULL, false, NULL, false, false, NULL, NULL, 20, 'example@gmail.com', '+36 20 123 4567', false, NULL, false, NULL, false, NULL, false, '[]', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, false, 'rendezvény közben', 'false', 'páraképződés', NULL, false, NULL, false, NULL, false, NULL, 'adsad', '1061 Budapest, Andrássy út 1.', NULL, NULL, NULL, NULL, NULL, 'adasdas', '1061 Budapest, Andrássy út 1.', '12345678-1-23', '+36 20 123 4567', 'pelda@email.hu', false, NULL, 'UF_TIG_JOVAHAGYASRA_VAR', NULL, NULL);
INSERT INTO public.kerveny (id, nev, leiras, helyszin, cim, kezdo_datum, veg_datum, kezdo_idopont, veg_idopont, tipus, minosites, sajto, jelleg, programterv, berendezesi_mod, szallasigeny, szallasigeny_letszam, parkolo, parkolo_reszletek, internet, hulladek, hulladek_elszallitas_modja, hulladek_elszallitas_felelos, letszam, email, telefon, oktatastechnika, oktatas_eszkozok, korlatozott_mozgas, korlatozott_mozgas_reszletek, foto, foto_reszletek, cater, catering_tipus, epites, epites_kezdet, epites_veg, epites_vallalkozok, epites_magas, epites_allvany, epites_kezi, epites_gepi, takaritas, takaritas_alatt, villanyszerelo, aramigeny, leg_szennyezes, egyeb_tevekenyseg, vegyi_anyag, vegyi_anyag_leiras, tuzveszelyes_tevekenyseg, tuzveszelyes_tevekenyseg_leiras, dekoracio, dekoracio_leiras, felelos, lakcim, tovabbi_szervezo, tovabbi_telefon, tovabbi_email, tovabbi_neptun, tovabbi_lakcim, megrendelo_nev, megrendelo_cim, megrendelo_ado, megrendelo_telefon, megrendelo_email, portaszolgalat, portaszolgalat_leiras, statusz, koltseg_osszesen, modositasi_indok) OVERRIDING SYSTEM VALUE VALUES (10, 'asdasdasdasdsa', 'dasdasdasd', 'dasdsad', '9026 Győr Egyetem tér 1', '2025-04-17 00:00:00', '2025-04-18 00:00:00', '20:48:00', '21:49:00', 'Egyetemi szervezésű hallgatói rendezvény', 'Nyilvános', false, 'adasdas', 'dsadsa', 'dsadasad', false, NULL, false, NULL, false, false, NULL, NULL, 20, 'example@gmail.com', '+36 20 123 4567', false, NULL, false, NULL, false, NULL, false, '[]', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, false, 'rendezvény közben', 'false', 'páraképződés', NULL, false, NULL, false, NULL, false, NULL, 'adsad', '1061 Budapest, Andrássy út 1.', NULL, NULL, NULL, NULL, NULL, 'adasdas', '1061 Budapest, Andrássy út 1.', '12345678-1-23', '+36 20 123 4567', 'pelda@email.hu', false, NULL, 'LEZARVA', NULL, NULL);
INSERT INTO public.kerveny (id, nev, leiras, helyszin, cim, kezdo_datum, veg_datum, kezdo_idopont, veg_idopont, tipus, minosites, sajto, jelleg, programterv, berendezesi_mod, szallasigeny, szallasigeny_letszam, parkolo, parkolo_reszletek, internet, hulladek, hulladek_elszallitas_modja, hulladek_elszallitas_felelos, letszam, email, telefon, oktatastechnika, oktatas_eszkozok, korlatozott_mozgas, korlatozott_mozgas_reszletek, foto, foto_reszletek, cater, catering_tipus, epites, epites_kezdet, epites_veg, epites_vallalkozok, epites_magas, epites_allvany, epites_kezi, epites_gepi, takaritas, takaritas_alatt, villanyszerelo, aramigeny, leg_szennyezes, egyeb_tevekenyseg, vegyi_anyag, vegyi_anyag_leiras, tuzveszelyes_tevekenyseg, tuzveszelyes_tevekenyseg_leiras, dekoracio, dekoracio_leiras, felelos, lakcim, tovabbi_szervezo, tovabbi_telefon, tovabbi_email, tovabbi_neptun, tovabbi_lakcim, megrendelo_nev, megrendelo_cim, megrendelo_ado, megrendelo_telefon, megrendelo_email, portaszolgalat, portaszolgalat_leiras, statusz, koltseg_osszesen, modositasi_indok) OVERRIDING SYSTEM VALUE VALUES (9, 'asdasdasdasdsa', 'dasdasdasd', 'dasdsad', '9026 Győr Egyetem tér 1', '2025-04-17 00:00:00', '2025-04-18 00:00:00', '20:48:00', '21:49:00', 'Egyetemi szervezésű hallgatói rendezvény', 'Nyilvános', false, 'adasdas', 'dsadsa', 'dsadasad', false, NULL, false, NULL, false, false, NULL, NULL, 20, 'example@gmail.com', '+36 20 123 4567', false, NULL, false, NULL, false, NULL, false, '[]', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, false, 'rendezvény közben', 'false', 'páraképződés', NULL, false, NULL, false, NULL, false, NULL, 'adsad', '1061 Budapest, Andrássy út 1.', NULL, NULL, NULL, NULL, NULL, 'adasdas', '1061 Budapest, Andrássy út 1.', '12345678-1-23', '+36 20 123 4567', 'pelda@email.hu', false, NULL, 'ARAJANLAT_KESZITES_FOLYAMATBAN', NULL, NULL);
INSERT INTO public.kerveny (id, nev, leiras, helyszin, cim, kezdo_datum, veg_datum, kezdo_idopont, veg_idopont, tipus, minosites, sajto, jelleg, programterv, berendezesi_mod, szallasigeny, szallasigeny_letszam, parkolo, parkolo_reszletek, internet, hulladek, hulladek_elszallitas_modja, hulladek_elszallitas_felelos, letszam, email, telefon, oktatastechnika, oktatas_eszkozok, korlatozott_mozgas, korlatozott_mozgas_reszletek, foto, foto_reszletek, cater, catering_tipus, epites, epites_kezdet, epites_veg, epites_vallalkozok, epites_magas, epites_allvany, epites_kezi, epites_gepi, takaritas, takaritas_alatt, villanyszerelo, aramigeny, leg_szennyezes, egyeb_tevekenyseg, vegyi_anyag, vegyi_anyag_leiras, tuzveszelyes_tevekenyseg, tuzveszelyes_tevekenyseg_leiras, dekoracio, dekoracio_leiras, felelos, lakcim, tovabbi_szervezo, tovabbi_telefon, tovabbi_email, tovabbi_neptun, tovabbi_lakcim, megrendelo_nev, megrendelo_cim, megrendelo_ado, megrendelo_telefon, megrendelo_email, portaszolgalat, portaszolgalat_leiras, statusz, koltseg_osszesen, modositasi_indok) OVERRIDING SYSTEM VALUE VALUES (12, 'gfgdfgfdg', 'fdgdfgdf', 'gfdgfd', '4028 Debrecen Kassai út 26', '2025-04-15 00:00:00', '2025-04-15 00:00:00', '21:29:00', '22:30:00', 'Külső szervezésű sportrendezvény', 'Nyilvános', false, 'dasd', 'asdasdas', 'dasdadsa', false, NULL, false, NULL, false, false, NULL, NULL, 30, 'example@gmail.com', '+36 20 123 4567', false, NULL, false, NULL, false, NULL, false, '[]', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, false, 'rendezvény közben', 'false', 'páraképződés', NULL, false, NULL, false, NULL, false, NULL, 'dsadasdasdasd', '1061 Budapest, Andrássy út 1.', NULL, NULL, NULL, NULL, NULL, 'adasdas', '1061 Budapest, Andrássy út 1.', '12345678-1-23', '+36 20 123 4567', 'pelda@email.hu', false, NULL, 'SZERZODES_ALAIRVA', NULL, NULL);
INSERT INTO public.kerveny (id, nev, leiras, helyszin, cim, kezdo_datum, veg_datum, kezdo_idopont, veg_idopont, tipus, minosites, sajto, jelleg, programterv, berendezesi_mod, szallasigeny, szallasigeny_letszam, parkolo, parkolo_reszletek, internet, hulladek, hulladek_elszallitas_modja, hulladek_elszallitas_felelos, letszam, email, telefon, oktatastechnika, oktatas_eszkozok, korlatozott_mozgas, korlatozott_mozgas_reszletek, foto, foto_reszletek, cater, catering_tipus, epites, epites_kezdet, epites_veg, epites_vallalkozok, epites_magas, epites_allvany, epites_kezi, epites_gepi, takaritas, takaritas_alatt, villanyszerelo, aramigeny, leg_szennyezes, egyeb_tevekenyseg, vegyi_anyag, vegyi_anyag_leiras, tuzveszelyes_tevekenyseg, tuzveszelyes_tevekenyseg_leiras, dekoracio, dekoracio_leiras, felelos, lakcim, tovabbi_szervezo, tovabbi_telefon, tovabbi_email, tovabbi_neptun, tovabbi_lakcim, megrendelo_nev, megrendelo_cim, megrendelo_ado, megrendelo_telefon, megrendelo_email, portaszolgalat, portaszolgalat_leiras, statusz, koltseg_osszesen, modositasi_indok) OVERRIDING SYSTEM VALUE VALUES (7, 'Egyetemi Sportnap', 'Hallgatói sportverseny több sportágban', 'Egyetemi Sportcsarnok', '9026 Győr, Egyetem tér 1.', '2025-04-21 00:00:00', '2025-02-27 00:00:00', '10:00:00', '18:00:00', 'Egyetemi szervezésű sportrendezvény', 'Zártkörű', NULL, 'sportverseny', 'Megnyitó, csapatversenyek, egyéni versenyek, eredményhirdetés', 'Versenyállomások, bírói asztalok', NULL, NULL, NULL, 'Kb. 30 parkolóhely szükséges', NULL, NULL, 'egyetem', NULL, 200, 'sport@sze.hu', '+36309876543', NULL, NULL, NULL, 'Akadálymentes megközelítés biztosított', NULL, 'Sport fotózás, videókészítés', NULL, '"[\"hideg étel\",\"kávé, tea, üdítő\"]"', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'nem szükséges', NULL, 'egyik sem várható', NULL, NULL, NULL, NULL, NULL, NULL, 'Egyetemi zászlók, molinók', 'Kovács Tamás', '9024 Győr, Ikva utca 8.', NULL, NULL, NULL, NULL, NULL, 'Széchenyi Egyetem Sportegyesület', '9026 Győr, Egyetem tér 1.', '18308344-2-41', '+3696503450', 'sport@sze.hu', NULL, 'Teljes időtartam alatt', 'ARAJANLAT_ELFOGADASRA_VAR', 50000.00, NULL);
INSERT INTO public.kerveny (id, nev, leiras, helyszin, cim, kezdo_datum, veg_datum, kezdo_idopont, veg_idopont, tipus, minosites, sajto, jelleg, programterv, berendezesi_mod, szallasigeny, szallasigeny_letszam, parkolo, parkolo_reszletek, internet, hulladek, hulladek_elszallitas_modja, hulladek_elszallitas_felelos, letszam, email, telefon, oktatastechnika, oktatas_eszkozok, korlatozott_mozgas, korlatozott_mozgas_reszletek, foto, foto_reszletek, cater, catering_tipus, epites, epites_kezdet, epites_veg, epites_vallalkozok, epites_magas, epites_allvany, epites_kezi, epites_gepi, takaritas, takaritas_alatt, villanyszerelo, aramigeny, leg_szennyezes, egyeb_tevekenyseg, vegyi_anyag, vegyi_anyag_leiras, tuzveszelyes_tevekenyseg, tuzveszelyes_tevekenyseg_leiras, dekoracio, dekoracio_leiras, felelos, lakcim, tovabbi_szervezo, tovabbi_telefon, tovabbi_email, tovabbi_neptun, tovabbi_lakcim, megrendelo_nev, megrendelo_cim, megrendelo_ado, megrendelo_telefon, megrendelo_email, portaszolgalat, portaszolgalat_leiras, statusz, koltseg_osszesen, modositasi_indok) OVERRIDING SYSTEM VALUE VALUES (6, 'Egyetemi Tavaszi Fesztivál', 'Hallgatói rendezvény koncertekkel, programokkal', 'Campus szabadtéri terület', '9026 Győr, Egyetem tér 1.', '2025-04-20 00:00:00', '2025-04-22 00:00:00', '14:00:00', '23:00:00', 'Egyetemi szervezésű hallgatói rendezvény', 'Nyilvános', true, 'fesztivál', 'Zenei programok, táncbemutatók, versenyek, játékok', 'Színpad, nézőtér, standok', false, NULL, true, 'Campus és környéki parkolók, kb. 200 autó', true, true, 'sajat', 'ABC Hulladékkezelő Kft.', 800, 'fesztival@ehok.sze.hu', '+36203456789', false, NULL, true, 'Kerekesszékes bejárat és mosdó biztosítva', true, 'kamerák, drón', true, '["meleg étel", "hideg étel", "kávé, tea, üdítő"]', true, '2025-04-19 08:00:00', '2025-04-23 12:00:00', 'XYZ Színpadtechnika, Food Truck szolgáltatók', NULL, NULL, NULL, NULL, true, true, 'rendezvény közben', 'igen', 'egyik sem várható', NULL, false, NULL, true, 'Tűzijáték, az engedélyek beszerzésre kerültek', true, 'Fényfüzérek, léggömbök, zászlók', 'Kiss Péter', '9022 Győr, Árpád út 12.', 'igen', '+36701234567', 'kiss.peter@ehok.sze.hu', NULL, NULL, 'Széchenyi Egyetem Hallgatói Önkormányzat', '9026 Győr, Egyetem tér 1.', '18308344-2-41', '+3696503500', 'ehok@sze.hu', true, 'Este 22:00 után fokozott portaszolgálat', 'ARAJANLAT_ELFOGADASRA_VAR', 1740000.00, NULL);
INSERT INTO public.kerveny (id, nev, leiras, helyszin, cim, kezdo_datum, veg_datum, kezdo_idopont, veg_idopont, tipus, minosites, sajto, jelleg, programterv, berendezesi_mod, szallasigeny, szallasigeny_letszam, parkolo, parkolo_reszletek, internet, hulladek, hulladek_elszallitas_modja, hulladek_elszallitas_felelos, letszam, email, telefon, oktatastechnika, oktatas_eszkozok, korlatozott_mozgas, korlatozott_mozgas_reszletek, foto, foto_reszletek, cater, catering_tipus, epites, epites_kezdet, epites_veg, epites_vallalkozok, epites_magas, epites_allvany, epites_kezi, epites_gepi, takaritas, takaritas_alatt, villanyszerelo, aramigeny, leg_szennyezes, egyeb_tevekenyseg, vegyi_anyag, vegyi_anyag_leiras, tuzveszelyes_tevekenyseg, tuzveszelyes_tevekenyseg_leiras, dekoracio, dekoracio_leiras, felelos, lakcim, tovabbi_szervezo, tovabbi_telefon, tovabbi_email, tovabbi_neptun, tovabbi_lakcim, megrendelo_nev, megrendelo_cim, megrendelo_ado, megrendelo_telefon, megrendelo_email, portaszolgalat, portaszolgalat_leiras, statusz, koltseg_osszesen, modositasi_indok) OVERRIDING SYSTEM VALUE VALUES (14, 'John Rendezvény', 'asdasdsadadasdasdasd', 'asdasdasasasda', '9026 Győr Egyetem tér 1', '2025-09-18 00:00:00', '2025-09-16 00:00:00', '21:22:00', '21:22:00', 'Egyetemi szervezésű sportrendezvény', 'Nyilvános', true, 'adwdwadwadawd', 'dwdawdawdwad', 'awdawdawdawdaw', true, 30, true, 'szex', true, true, 'sajat', 'Pisti', 400, 'example@sze.hu', '+36 20 123 4567', false, NULL, false, NULL, false, NULL, false, '[]', false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, false, 'rendezvény közben', 'false', 'füst', NULL, false, NULL, false, NULL, false, NULL, 'Cigány Cigány', '1061 Budapest Andrássy út 1', NULL, NULL, NULL, NULL, NULL, 'sadsa', '1061 Budapest Andrássy út 1', '12345678-1-23', '+36 20 123 4567', 'pelda@email.hu', false, NULL, 'ARAJANLAT_ELFOGADASRA_VAR', 2890000.00, NULL);
INSERT INTO public.kerveny (id, nev, leiras, helyszin, cim, kezdo_datum, veg_datum, kezdo_idopont, veg_idopont, tipus, minosites, sajto, jelleg, programterv, berendezesi_mod, szallasigeny, szallasigeny_letszam, parkolo, parkolo_reszletek, internet, hulladek, hulladek_elszallitas_modja, hulladek_elszallitas_felelos, letszam, email, telefon, oktatastechnika, oktatas_eszkozok, korlatozott_mozgas, korlatozott_mozgas_reszletek, foto, foto_reszletek, cater, catering_tipus, epites, epites_kezdet, epites_veg, epites_vallalkozok, epites_magas, epites_allvany, epites_kezi, epites_gepi, takaritas, takaritas_alatt, villanyszerelo, aramigeny, leg_szennyezes, egyeb_tevekenyseg, vegyi_anyag, vegyi_anyag_leiras, tuzveszelyes_tevekenyseg, tuzveszelyes_tevekenyseg_leiras, dekoracio, dekoracio_leiras, felelos, lakcim, tovabbi_szervezo, tovabbi_telefon, tovabbi_email, tovabbi_neptun, tovabbi_lakcim, megrendelo_nev, megrendelo_cim, megrendelo_ado, megrendelo_telefon, megrendelo_email, portaszolgalat, portaszolgalat_leiras, statusz, koltseg_osszesen, modositasi_indok) OVERRIDING SYSTEM VALUE VALUES (3, 'nevnev', 'Megváltoztatott leírás', 'Miklós', 'qdqwdwdqwdqwd', '2025-03-29 00:00:00', '2025-04-01 00:00:00', '02:31:00', '18:52:00', 'Egyetemi szervezésű rendezvény', 'Nyilvános', NULL, 'valamivalami', 'kjosdafpjkdspfoarqa', 'qewrtgerqgqeg', NULL, 5, NULL, 'RENDSZAM', NULL, NULL, 'sajat', 'Pisti', 30, 'souris20013@gmail.com', '06302345687', NULL, 'LAPTOP', NULL, 'SADAS', NULL, 'GOPRO', NULL, '"\"[\\\"kávé, tea, üdítő\\\",\\\"hideg étel\\\"]\""', NULL, '2025-12-10 00:00:00', '2025-02-12 00:00:00', 'DOKTOR BÉLA', NULL, NULL, NULL, NULL, NULL, NULL, 'rendezvény előtt', NULL, 'egyik sem várható', NULL, NULL, 'EFGDFGDFG', NULL, 'NEMTOM', NULL, 'LSDFLSDFL', 'TESZT PISTA', 'Győr,Egyetem K0', NULL, NULL, NULL, NULL, NULL, 'wdqw', 'qdq', '1231232', 'frwfwrf', 'akssdkakdasd', NULL, 'WREGWRGWR', 'LEMONDVA', 1300000.00, NULL);
INSERT INTO public.kerveny (id, nev, leiras, helyszin, cim, kezdo_datum, veg_datum, kezdo_idopont, veg_idopont, tipus, minosites, sajto, jelleg, programterv, berendezesi_mod, szallasigeny, szallasigeny_letszam, parkolo, parkolo_reszletek, internet, hulladek, hulladek_elszallitas_modja, hulladek_elszallitas_felelos, letszam, email, telefon, oktatastechnika, oktatas_eszkozok, korlatozott_mozgas, korlatozott_mozgas_reszletek, foto, foto_reszletek, cater, catering_tipus, epites, epites_kezdet, epites_veg, epites_vallalkozok, epites_magas, epites_allvany, epites_kezi, epites_gepi, takaritas, takaritas_alatt, villanyszerelo, aramigeny, leg_szennyezes, egyeb_tevekenyseg, vegyi_anyag, vegyi_anyag_leiras, tuzveszelyes_tevekenyseg, tuzveszelyes_tevekenyseg_leiras, dekoracio, dekoracio_leiras, felelos, lakcim, tovabbi_szervezo, tovabbi_telefon, tovabbi_email, tovabbi_neptun, tovabbi_lakcim, megrendelo_nev, megrendelo_cim, megrendelo_ado, megrendelo_telefon, megrendelo_email, portaszolgalat, portaszolgalat_leiras, statusz, koltseg_osszesen, modositasi_indok) OVERRIDING SYSTEM VALUE VALUES (4, 'Teszt Rendezveny', NULL, 'Otthonasd', NULL, '2025-04-05 00:00:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'MEGVALOSULASRA_VAR', 5100000.00, NULL);
INSERT INTO public.kerveny (id, nev, leiras, helyszin, cim, kezdo_datum, veg_datum, kezdo_idopont, veg_idopont, tipus, minosites, sajto, jelleg, programterv, berendezesi_mod, szallasigeny, szallasigeny_letszam, parkolo, parkolo_reszletek, internet, hulladek, hulladek_elszallitas_modja, hulladek_elszallitas_felelos, letszam, email, telefon, oktatastechnika, oktatas_eszkozok, korlatozott_mozgas, korlatozott_mozgas_reszletek, foto, foto_reszletek, cater, catering_tipus, epites, epites_kezdet, epites_veg, epites_vallalkozok, epites_magas, epites_allvany, epites_kezi, epites_gepi, takaritas, takaritas_alatt, villanyszerelo, aramigeny, leg_szennyezes, egyeb_tevekenyseg, vegyi_anyag, vegyi_anyag_leiras, tuzveszelyes_tevekenyseg, tuzveszelyes_tevekenyseg_leiras, dekoracio, dekoracio_leiras, felelos, lakcim, tovabbi_szervezo, tovabbi_telefon, tovabbi_email, tovabbi_neptun, tovabbi_lakcim, megrendelo_nev, megrendelo_cim, megrendelo_ado, megrendelo_telefon, megrendelo_email, portaszolgalat, portaszolgalat_leiras, statusz, koltseg_osszesen, modositasi_indok) OVERRIDING SYSTEM VALUE VALUES (8, 'AAAAAAAAAAA', 'Teszt leírás', 'Szobám', 'Otthon', '2025-04-08 00:00:00', '2025-12-11 00:00:00', '13:23:00', '12:12:00', 'Egyetemi szervezésű hallgatói rendezvény', 'Nyilvános', NULL, '1dqsedq', 'qdqwdqwdqw', 'dwqdqwdqw', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 21, 'souris20013@gmail.com', '06705672345', NULL, NULL, NULL, NULL, NULL, 'dasdasd', NULL, '"[\"hideg étel\",\"meleg étel\"]"', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'rendezvény előtt', NULL, 'páraképződés', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'John Doe', 'Mosonmagyaróvár', NULL, NULL, NULL, NULL, NULL, 'inc', 'Mosonmagyaróvár', '102120120', '06304563478', 'example@gmail.com', NULL, NULL, 'MEGVALOSULASRA_VAR', 997000.00, 'sadasd');
INSERT INTO public.kerveny (id, nev, leiras, helyszin, cim, kezdo_datum, veg_datum, kezdo_idopont, veg_idopont, tipus, minosites, sajto, jelleg, programterv, berendezesi_mod, szallasigeny, szallasigeny_letszam, parkolo, parkolo_reszletek, internet, hulladek, hulladek_elszallitas_modja, hulladek_elszallitas_felelos, letszam, email, telefon, oktatastechnika, oktatas_eszkozok, korlatozott_mozgas, korlatozott_mozgas_reszletek, foto, foto_reszletek, cater, catering_tipus, epites, epites_kezdet, epites_veg, epites_vallalkozok, epites_magas, epites_allvany, epites_kezi, epites_gepi, takaritas, takaritas_alatt, villanyszerelo, aramigeny, leg_szennyezes, egyeb_tevekenyseg, vegyi_anyag, vegyi_anyag_leiras, tuzveszelyes_tevekenyseg, tuzveszelyes_tevekenyseg_leiras, dekoracio, dekoracio_leiras, felelos, lakcim, tovabbi_szervezo, tovabbi_telefon, tovabbi_email, tovabbi_neptun, tovabbi_lakcim, megrendelo_nev, megrendelo_cim, megrendelo_ado, megrendelo_telefon, megrendelo_email, portaszolgalat, portaszolgalat_leiras, statusz, koltseg_osszesen, modositasi_indok) OVERRIDING SYSTEM VALUE VALUES (13, 'valami valami', 'ASDASDASDASD', 'sadada', '4028 Debrecen Kassai út 26', '2025-08-06 00:00:00', '2025-08-06 00:00:00', '14:24:00', '14:24:00', 'Egyetemi szervezésű hallgatói rendezvény', 'Nyilvános', NULL, 'Workshop', 'SZEX', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 300, 'asdsadsad@szex.hu', '+36 20 123 4567', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '"[]"', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'nem szükséges', NULL, 'por', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'szex', '1061 Budapest, Andrássy út 1.', NULL, NULL, NULL, NULL, NULL, 'asd', '1061 Budapest, Andrássy út 1.', '12345678-1-23', '+36 20 123 4567', 'pelda@email.hu', NULL, NULL, 'ARAJANLAT_KESZITESERE_VAR', 390000.00, NULL);
INSERT INTO public.kerveny (id, nev, leiras, helyszin, cim, kezdo_datum, veg_datum, kezdo_idopont, veg_idopont, tipus, minosites, sajto, jelleg, programterv, berendezesi_mod, szallasigeny, szallasigeny_letszam, parkolo, parkolo_reszletek, internet, hulladek, hulladek_elszallitas_modja, hulladek_elszallitas_felelos, letszam, email, telefon, oktatastechnika, oktatas_eszkozok, korlatozott_mozgas, korlatozott_mozgas_reszletek, foto, foto_reszletek, cater, catering_tipus, epites, epites_kezdet, epites_veg, epites_vallalkozok, epites_magas, epites_allvany, epites_kezi, epites_gepi, takaritas, takaritas_alatt, villanyszerelo, aramigeny, leg_szennyezes, egyeb_tevekenyseg, vegyi_anyag, vegyi_anyag_leiras, tuzveszelyes_tevekenyseg, tuzveszelyes_tevekenyseg_leiras, dekoracio, dekoracio_leiras, felelos, lakcim, tovabbi_szervezo, tovabbi_telefon, tovabbi_email, tovabbi_neptun, tovabbi_lakcim, megrendelo_nev, megrendelo_cim, megrendelo_ado, megrendelo_telefon, megrendelo_email, portaszolgalat, portaszolgalat_leiras, statusz, koltseg_osszesen, modositasi_indok) OVERRIDING SYSTEM VALUE VALUES (5, 'Digitális Átalakulás Konferencib', 'Digitális transzformáció és innovációs lehetőségek az iparban', 'Auditorium Maximum', '9026 Győr, Egyetem tér 1.', '2025-05-12 00:00:00', '2025-05-13 00:00:00', '09:00:00', '17:00:00', 'Egyetemi szervezésű rendezvény', 'Nyilvános', NULL, 'konferencia', 'Megnyitó beszéd, szakmai előadások, workshop, kerekasztal beszélgetés, zárszó', 'Színpad, széksorok, vetítővászon, előadói asztalok', NULL, 15, NULL, 'Kb. 50 gépkocsi, egyetemi parkolóban', NULL, NULL, 'egyetem', NULL, 150, 'souris20013@gmail.com', '+36301234567', NULL, 'projektor, laptop, hangosítás, mikrofonok', NULL, NULL, NULL, 'professzionális fotós', NULL, '"[\"kávé, tea, üdítő\",\"hideg étel\"]"', NULL, '2025-05-12 00:00:00', '2025-05-14 00:00:00', 'Technikai csapat, AV szolgáltató', NULL, NULL, NULL, NULL, NULL, NULL, 'rendezvény előtt', NULL, 'egyik sem várható', NULL, NULL, NULL, NULL, NULL, NULL, 'Roll-up bannerek, virágdekoráció', 'Dr. Nagy János', '9024 Győr, Budai út 5.', NULL, '+36207654321', 'nagy.janos@sze.hu', NULL, NULL, 'Széchenyi István Egyetem', '9026 Győr, Egyetem tér 1.', '18308344-2-41', '+3696503400', 'info@sze.hu', NULL, 'Teljes nyitvatartás alatt portaszolgálat szükséges', 'ARAJANLAT_ELFOGADASRA_VAR', 940000.00, NULL);


--
-- Data for Name: kerveny_koltseg; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.kerveny_koltseg (id, kerveny_id, service_id, service_name, rate_key, unit, hours, persons, unit_price, line_total, created_at, pricing_type, occasions, days, quantity) VALUES (13, 3, NULL, NULL, 'priceUniversity', NULL, 0.00, 0.00, 0.00, 0.00, '2025-10-01 09:54:07.402246', 'famulus', 0.00, 0.00, 0.00);
INSERT INTO public.kerveny_koltseg (id, kerveny_id, service_id, service_name, rate_key, unit, hours, persons, unit_price, line_total, created_at, pricing_type, occasions, days, quantity) VALUES (23, 7, 18, 'MC 001 és 002 bérleti díja', 'priceUniversity', 'nap', 0.00, 0.00, 10000.00, 50000.00, '2025-10-07 16:49:20.401352', 'famulus', 0.00, 5.00, 0.00);
INSERT INTO public.kerveny_koltseg (id, kerveny_id, service_id, service_name, rate_key, unit, hours, persons, unit_price, line_total, created_at, pricing_type, occasions, days, quantity) VALUES (111, 8, 10, 'Rendezvényeken, indokolt esetben egyéb helyszíneken biztonsági személyzet díja (min. 4 óra)', 'priceUniversity', 'fő/óra', 21.00, 2.00, 3500.00, 147000.00, '2025-11-04 21:58:57.785518', 'famulus', 0.00, 0.00, 0.00);
INSERT INTO public.kerveny_koltseg (id, kerveny_id, service_id, service_name, rate_key, unit, hours, persons, unit_price, line_total, created_at, pricing_type, occasions, days, quantity) VALUES (112, 8, 9, 'Rendezvénybiztos szolgáltatás díja (rendezvényeken femerülő biztonsági feladatok koordinálása, min. 4 óra)', 'priceUniversity', 'fő/óra', 10.00, 10.00, 5500.00, 550000.00, '2025-11-04 21:58:57.785518', 'famulus', 0.00, 0.00, 0.00);
INSERT INTO public.kerveny_koltseg (id, kerveny_id, service_id, service_name, rate_key, unit, hours, persons, unit_price, line_total, created_at, pricing_type, occasions, days, quantity) VALUES (113, 8, 29, 'Háló leszedése alpintechnikával', 'priceUniversity', 'alkalom', 0.00, 0.00, 10000.00, 100000.00, '2025-11-04 21:59:42.221717', 'famulus', 10.00, 0.00, 0.00);
INSERT INTO public.kerveny_koltseg (id, kerveny_id, service_id, service_name, rate_key, unit, hours, persons, unit_price, line_total, created_at, pricing_type, occasions, days, quantity) VALUES (29, 3, 29, 'Háló leszedése alpintechnikával', 'priceUniversity', 'alkalom', 0.00, 0.00, 10000.00, 100000.00, '2025-10-15 17:53:55.306954', 'famulus', 10.00, 0.00, 0.00);
INSERT INTO public.kerveny_koltseg (id, kerveny_id, service_id, service_name, rate_key, unit, hours, persons, unit_price, line_total, created_at, pricing_type, occasions, days, quantity) VALUES (30, 3, 30, 'Székek bérlése', 'priceUniversity', 'db/alkalom', 0.00, 0.00, 10000.00, 1000000.00, '2025-10-15 17:53:55.306954', 'famulus', 10.00, 0.00, 10.00);
INSERT INTO public.kerveny_koltseg (id, kerveny_id, service_id, service_name, rate_key, unit, hours, persons, unit_price, line_total, created_at, pricing_type, occasions, days, quantity) VALUES (31, 3, 26, 'Portaszolgálat', 'priceUniversity', 'óra', 10.00, 0.00, 10000.00, 100000.00, '2025-10-15 17:53:55.306954', 'famulus', 0.00, 0.00, 0.00);
INSERT INTO public.kerveny_koltseg (id, kerveny_id, service_id, service_name, rate_key, unit, hours, persons, unit_price, line_total, created_at, pricing_type, occasions, days, quantity) VALUES (32, 3, 18, 'MC 001 és 002 bérleti díja', 'priceUniversity', 'nap', 0.00, 0.00, 10000.00, 100000.00, '2025-10-15 17:53:55.306954', 'famulus', 0.00, 10.00, 0.00);
INSERT INTO public.kerveny_koltseg (id, kerveny_id, service_id, service_name, rate_key, unit, hours, persons, unit_price, line_total, created_at, pricing_type, occasions, days, quantity) VALUES (114, 8, 29, 'Háló leszedése alpintechnikával', 'priceUniversity', 'alkalom', 0.00, 0.00, 10000.00, 100000.00, '2025-11-04 21:59:42.221717', 'famulus', 10.00, 0.00, 0.00);
INSERT INTO public.kerveny_koltseg (id, kerveny_id, service_id, service_name, rate_key, unit, hours, persons, unit_price, line_total, created_at, pricing_type, occasions, days, quantity) VALUES (115, 8, 27, 'Biztonsági terv, bejelentéshez szükséges dokumentáció elkészítése', 'priceUniversity', 'alkalom', 0.00, 0.00, 10000.00, 100000.00, '2025-11-04 21:59:42.221717', 'famulus', 10.00, 0.00, 0.00);
INSERT INTO public.kerveny_koltseg (id, kerveny_id, service_id, service_name, rate_key, unit, hours, persons, unit_price, line_total, created_at, pricing_type, occasions, days, quantity) VALUES (38, 6, 9, 'Rendezvénybiztos szolgáltatás díja (rendezvényeken femerülő biztonsági feladatok koordinálása, min. 4 óra)', 'priceUniversity', 'fő/óra', 10.00, 10.00, 5500.00, 550000.00, '2025-10-15 19:01:35.712512', 'famulus', 0.00, 0.00, 0.00);
INSERT INTO public.kerveny_koltseg (id, kerveny_id, service_id, service_name, rate_key, unit, hours, persons, unit_price, line_total, created_at, pricing_type, occasions, days, quantity) VALUES (39, 6, 12, 'Tűz- munkavédelmi szolgáltatás díja', 'priceExternal', 'fő/óra', 10.00, 10.00, 11000.00, 1100000.00, '2025-10-15 19:01:35.712512', 'famulus', 0.00, 0.00, 0.00);
INSERT INTO public.kerveny_koltseg (id, kerveny_id, service_id, service_name, rate_key, unit, hours, persons, unit_price, line_total, created_at, pricing_type, occasions, days, quantity) VALUES (40, 6, 29, 'Háló leszedése alpintechnikával', 'priceUniversity', 'alkalom', 0.00, 0.00, 10000.00, 40000.00, '2025-10-15 19:01:41.910539', 'famulus', 4.00, 0.00, 0.00);
INSERT INTO public.kerveny_koltseg (id, kerveny_id, service_id, service_name, rate_key, unit, hours, persons, unit_price, line_total, created_at, pricing_type, occasions, days, quantity) VALUES (41, 6, 22, 'Takarítás', 'priceUniversity', 'fő/óra', 2.00, 2.00, 10000.00, 40000.00, '2025-10-15 19:01:41.910539', 'famulus', 0.00, 0.00, 0.00);
INSERT INTO public.kerveny_koltseg (id, kerveny_id, service_id, service_name, rate_key, unit, hours, persons, unit_price, line_total, created_at, pricing_type, occasions, days, quantity) VALUES (42, 6, 19, 'MC 121 bérleti díja', 'priceUniversity', 'nap', 0.00, 0.00, 10000.00, 10000.00, '2025-10-15 19:01:41.910539', 'famulus', 0.00, 1.00, 0.00);
INSERT INTO public.kerveny_koltseg (id, kerveny_id, service_id, service_name, rate_key, unit, hours, persons, unit_price, line_total, created_at, pricing_type, occasions, days, quantity) VALUES (43, 14, 6, 'Eseti gondnoksági feladatok óradíja', 'priceUniversity', 'fő/óra', 10.00, 10.00, 3900.00, 390000.00, '2025-10-15 19:41:43.611159', 'famulus', 0.00, 0.00, 0.00);
INSERT INTO public.kerveny_koltseg (id, kerveny_id, service_id, service_name, rate_key, unit, hours, persons, unit_price, line_total, created_at, pricing_type, occasions, days, quantity) VALUES (44, 14, 10, 'Rendezvényeken, indokolt esetben egyéb helyszíneken biztonsági személyzet díja (min. 4 óra)', 'priceUniversity', 'fő/óra', 10.00, 10.00, 3500.00, 350000.00, '2025-10-15 19:41:43.611159', 'famulus', 0.00, 0.00, 0.00);
INSERT INTO public.kerveny_koltseg (id, kerveny_id, service_id, service_name, rate_key, unit, hours, persons, unit_price, line_total, created_at, pricing_type, occasions, days, quantity) VALUES (45, 14, 13, 'Biztonságtechnikai szolgáltatás díja', 'priceExternalWeekend', 'fő/óra', 10.00, 10.00, 10000.00, 1000000.00, '2025-10-15 19:41:43.611159', 'famulus', 0.00, 0.00, 0.00);
INSERT INTO public.kerveny_koltseg (id, kerveny_id, service_id, service_name, rate_key, unit, hours, persons, unit_price, line_total, created_at, pricing_type, occasions, days, quantity) VALUES (46, 14, 30, 'Székek bérlése', 'priceUniversity', 'db/alkalom', 0.00, 0.00, 10000.00, 560000.00, '2025-10-15 19:43:07.42346', 'famulus', 7.00, 0.00, 8.00);
INSERT INTO public.kerveny_koltseg (id, kerveny_id, service_id, service_name, rate_key, unit, hours, persons, unit_price, line_total, created_at, pricing_type, occasions, days, quantity) VALUES (47, 14, 15, 'Győr Városi Egyetemi Csarnok takarítás', 'priceUniversity', 'alkalom', 0.00, 0.00, 40000.00, 400000.00, '2025-10-15 19:43:07.42346', 'famulus', 10.00, 0.00, 0.00);
INSERT INTO public.kerveny_koltseg (id, kerveny_id, service_id, service_name, rate_key, unit, hours, persons, unit_price, line_total, created_at, pricing_type, occasions, days, quantity) VALUES (48, 14, 27, 'Biztonsági terv, bejelentéshez szükséges dokumentáció elkészítése', 'priceUniversity', 'alkalom', 0.00, 0.00, 10000.00, 100000.00, '2025-10-15 19:43:07.42346', 'famulus', 10.00, 0.00, 0.00);
INSERT INTO public.kerveny_koltseg (id, kerveny_id, service_id, service_name, rate_key, unit, hours, persons, unit_price, line_total, created_at, pricing_type, occasions, days, quantity) VALUES (49, 14, 18, 'MC 001 és 002 bérleti díja', 'priceUniversity', 'nap', 0.00, 0.00, 10000.00, 90000.00, '2025-10-15 19:43:07.42346', 'famulus', 0.00, 9.00, 0.00);
INSERT INTO public.kerveny_koltseg (id, kerveny_id, service_id, service_name, rate_key, unit, hours, persons, unit_price, line_total, created_at, pricing_type, occasions, days, quantity) VALUES (55, 4, 8, 'Rendezvény biztonságszervezés, biztonsági dokumentáció díja, általános helyszín', 'priceUniversity', NULL, 10.00, 10.00, 50000.00, 5000000.00, '2025-10-15 21:22:10.744873', 'famulus', 0.00, 0.00, 0.00);
INSERT INTO public.kerveny_koltseg (id, kerveny_id, service_id, service_name, rate_key, unit, hours, persons, unit_price, line_total, created_at, pricing_type, occasions, days, quantity) VALUES (56, 4, 29, 'Háló leszedése alpintechnikával', 'priceUniversity', 'alkalom', 0.00, 0.00, 10000.00, 100000.00, '2025-10-15 21:22:17.29561', 'famulus', 10.00, 0.00, 0.00);
INSERT INTO public.kerveny_koltseg (id, kerveny_id, service_id, service_name, rate_key, unit, hours, persons, unit_price, line_total, created_at, pricing_type, occasions, days, quantity) VALUES (57, 13, 6, 'Eseti gondnoksági feladatok óradíja', 'priceUniversity', 'fő/óra', 10.00, 10.00, 3900.00, 390000.00, '2025-10-15 21:22:32.293547', 'famulus', 0.00, 0.00, 0.00);
INSERT INTO public.kerveny_koltseg (id, kerveny_id, service_id, service_name, rate_key, unit, hours, persons, unit_price, line_total, created_at, pricing_type, occasions, days, quantity) VALUES (64, 5, 10, 'Rendezvényeken, indokolt esetben egyéb helyszíneken biztonsági személyzet díja (min. 4 óra)', 'priceUniversity', 'fő/óra', 10.00, 10.00, 3500.00, 350000.00, '2025-10-15 21:48:31.649121', 'famulus', 0.00, 0.00, 0.00);
INSERT INTO public.kerveny_koltseg (id, kerveny_id, service_id, service_name, rate_key, unit, hours, persons, unit_price, line_total, created_at, pricing_type, occasions, days, quantity) VALUES (65, 5, 10, 'Rendezvényeken, indokolt esetben egyéb helyszíneken biztonsági személyzet díja (min. 4 óra)', 'priceExternal', 'fő/óra', 10.00, 10.00, 3900.00, 390000.00, '2025-10-15 21:48:31.649121', 'famulus', 0.00, 0.00, 0.00);
INSERT INTO public.kerveny_koltseg (id, kerveny_id, service_id, service_name, rate_key, unit, hours, persons, unit_price, line_total, created_at, pricing_type, occasions, days, quantity) VALUES (66, 5, 26, 'Portaszolgálat', 'priceUniversity', 'óra', 10.00, 0.00, 10000.00, 100000.00, '2025-10-15 21:48:40.084332', 'famulus', 0.00, 0.00, 0.00);
INSERT INTO public.kerveny_koltseg (id, kerveny_id, service_id, service_name, rate_key, unit, hours, persons, unit_price, line_total, created_at, pricing_type, occasions, days, quantity) VALUES (67, 5, 18, 'MC 001 és 002 bérleti díja', 'priceUniversity', 'nap', 0.00, 0.00, 10000.00, 100000.00, '2025-10-15 21:48:40.084332', 'famulus', 0.00, 10.00, 0.00);


--
-- Data for Name: prices; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.prices (id, megnevezes, kategoria, mertekegyseg, ar_egyetem, ar_egyetem_hetvege, ar_kulso, ar_kulso_hetvege, megjegyzes, afa) VALUES (17, 'ÚT 114 terem bérleti díja', 'Egyetemi', 'nap', 10000, 12000, 15000, 18000, NULL, false);
INSERT INTO public.prices (id, megnevezes, kategoria, mertekegyseg, ar_egyetem, ar_egyetem_hetvege, ar_kulso, ar_kulso_hetvege, megjegyzes, afa) VALUES (16, 'ÚT aula bérleti díja', 'Egyetemi', 'nap', 10000, 12000, 15000, 18000, NULL, false);
INSERT INTO public.prices (id, megnevezes, kategoria, mertekegyseg, ar_egyetem, ar_egyetem_hetvege, ar_kulso, ar_kulso_hetvege, megjegyzes, afa) VALUES (14, 'Győr városi Egyetemi Csarnok bérleti díja', 'Egyetemi', 'nap', 80000, 80000, 100000, 100000, NULL, false);
INSERT INTO public.prices (id, megnevezes, kategoria, mertekegyseg, ar_egyetem, ar_egyetem_hetvege, ar_kulso, ar_kulso_hetvege, megjegyzes, afa) VALUES (21, 'MC 227 és 228 bérleti díja', 'Egyetemi', 'nap', 10000, 12000, 15000, 18000, NULL, false);
INSERT INTO public.prices (id, megnevezes, kategoria, mertekegyseg, ar_egyetem, ar_egyetem_hetvege, ar_kulso, ar_kulso_hetvege, megjegyzes, afa) VALUES (20, 'MC 122 és 123 bérleti díja', 'Egyetemi', 'nap', 10000, 12000, 15000, 18000, NULL, false);
INSERT INTO public.prices (id, megnevezes, kategoria, mertekegyseg, ar_egyetem, ar_egyetem_hetvege, ar_kulso, ar_kulso_hetvege, megjegyzes, afa) VALUES (19, 'MC 121 bérleti díja', 'Egyetemi', 'nap', 10000, 12000, 15000, 18000, NULL, false);
INSERT INTO public.prices (id, megnevezes, kategoria, mertekegyseg, ar_egyetem, ar_egyetem_hetvege, ar_kulso, ar_kulso_hetvege, megjegyzes, afa) VALUES (2, 'Eseti beltéri takarítás óradíja', 'UF', 'fő/óra', 3000, 3500, 3800, 4800, '', false);
INSERT INTO public.prices (id, megnevezes, kategoria, mertekegyseg, ar_egyetem, ar_egyetem_hetvege, ar_kulso, ar_kulso_hetvege, megjegyzes, afa) VALUES (4, 'Eseti kültéri takarítás óradíja', 'UF', 'fő/óra', 3000, 3500, 3800, 4800, '', false);
INSERT INTO public.prices (id, megnevezes, kategoria, mertekegyseg, ar_egyetem, ar_egyetem_hetvege, ar_kulso, ar_kulso_hetvege, megjegyzes, afa) VALUES (5, 'Eseti karbantartási feladatok óradíja', 'UF', 'fő/óra', 3900, 4500, 5000, 6000, '', false);
INSERT INTO public.prices (id, megnevezes, kategoria, mertekegyseg, ar_egyetem, ar_egyetem_hetvege, ar_kulso, ar_kulso_hetvege, megjegyzes, afa) VALUES (6, 'Eseti gondnoksági feladatok óradíja', 'UF', 'fő/óra', 3900, 4500, 5000, 6000, '', false);
INSERT INTO public.prices (id, megnevezes, kategoria, mertekegyseg, ar_egyetem, ar_egyetem_hetvege, ar_kulso, ar_kulso_hetvege, megjegyzes, afa) VALUES (9, 'Rendezvénybiztos szolgáltatás díja (rendezvényeken femerülő biztonsági feladatok koordinálása, min. 4 óra)', 'UF', 'fő/óra', 5500, 5500, 6000, 6000, '', false);
INSERT INTO public.prices (id, megnevezes, kategoria, mertekegyseg, ar_egyetem, ar_egyetem_hetvege, ar_kulso, ar_kulso_hetvege, megjegyzes, afa) VALUES (10, 'Rendezvényeken, indokolt esetben egyéb helyszíneken biztonsági személyzet díja (min. 4 óra)', 'UF', 'fő/óra', 3500, 3500, 3900, 3900, '', false);
INSERT INTO public.prices (id, megnevezes, kategoria, mertekegyseg, ar_egyetem, ar_egyetem_hetvege, ar_kulso, ar_kulso_hetvege, megjegyzes, afa) VALUES (11, 'Zenés-táncos rendezvényeken, indokolt esetben kiemelt helyszíneken biztonsági személyzet díja (min. 4 óra)', 'UF', 'fő/óra', 3900, 3900, 4500, 4500, '', false);
INSERT INTO public.prices (id, megnevezes, kategoria, mertekegyseg, ar_egyetem, ar_egyetem_hetvege, ar_kulso, ar_kulso_hetvege, megjegyzes, afa) VALUES (12, 'Tűz- munkavédelmi szolgáltatás díja', 'UF', 'fő/óra', 8500, 8500, 11000, 11000, '', false);
INSERT INTO public.prices (id, megnevezes, kategoria, mertekegyseg, ar_egyetem, ar_egyetem_hetvege, ar_kulso, ar_kulso_hetvege, megjegyzes, afa) VALUES (3, 'Eseti recepció/porta óradíja', 'UF', 'fő/óra', 3000, 3000, 3800, 3800, '', false);
INSERT INTO public.prices (id, megnevezes, kategoria, mertekegyseg, ar_egyetem, ar_egyetem_hetvege, ar_kulso, ar_kulso_hetvege, megjegyzes, afa) VALUES (13, 'Biztonságtechnikai szolgáltatás díja', 'UF', 'fő/óra', 8000, 8000, 10000, 10000, '', false);
INSERT INTO public.prices (id, megnevezes, kategoria, mertekegyseg, ar_egyetem, ar_egyetem_hetvege, ar_kulso, ar_kulso_hetvege, megjegyzes, afa) VALUES (8, 'Rendezvény biztonságszervezés, biztonsági dokumentáció díja, általános helyszín', 'UF', NULL, 50000, 50000, 70000, 70000, '', false);
INSERT INTO public.prices (id, megnevezes, kategoria, mertekegyseg, ar_egyetem, ar_egyetem_hetvege, ar_kulso, ar_kulso_hetvege, megjegyzes, afa) VALUES (7, 'Rendezvény biztonságszervezés, biztonsági dokumentáció díja, kiemelt helyszín', 'UF', NULL, 85000, 85000, 110000, 110000, '', false);
INSERT INTO public.prices (id, megnevezes, kategoria, mertekegyseg, ar_egyetem, ar_egyetem_hetvege, ar_kulso, ar_kulso_hetvege, megjegyzes, afa) VALUES (18, 'MC 001 és 002 bérleti díja', 'Egyetemi', 'nap', 10000, 12000, 15000, 18000, '', false);
INSERT INTO public.prices (id, megnevezes, kategoria, mertekegyseg, ar_egyetem, ar_egyetem_hetvege, ar_kulso, ar_kulso_hetvege, megjegyzes, afa) VALUES (15, 'Győr Városi Egyetemi Csarnok takarítás', 'Egyetemi', 'alkalom', 40000, 60000, 45000, 65000, '', true);
INSERT INTO public.prices (id, megnevezes, kategoria, mertekegyseg, ar_egyetem, ar_egyetem_hetvege, ar_kulso, ar_kulso_hetvege, megjegyzes, afa) VALUES (22, 'Takarítás', 'Egyetemi', 'fő/óra', 10000, 12000, 15000, 18000, '', true);
INSERT INTO public.prices (id, megnevezes, kategoria, mertekegyseg, ar_egyetem, ar_egyetem_hetvege, ar_kulso, ar_kulso_hetvege, megjegyzes, afa) VALUES (23, 'Műszaki ügyelet', 'Egyetemi', 'fő/óra', 10000, 12000, 15000, 18000, '', true);
INSERT INTO public.prices (id, megnevezes, kategoria, mertekegyseg, ar_egyetem, ar_egyetem_hetvege, ar_kulso, ar_kulso_hetvege, megjegyzes, afa) VALUES (25, 'Rendezvénybiztos', 'Egyetemi', 'óra', 10000, 12000, 15000, 18000, '', true);
INSERT INTO public.prices (id, megnevezes, kategoria, mertekegyseg, ar_egyetem, ar_egyetem_hetvege, ar_kulso, ar_kulso_hetvege, megjegyzes, afa) VALUES (24, 'Biztonsági személyzet', 'Egyetemi', 'fő/óra', 10000, 12000, 15000, 18000, '', true);
INSERT INTO public.prices (id, megnevezes, kategoria, mertekegyseg, ar_egyetem, ar_egyetem_hetvege, ar_kulso, ar_kulso_hetvege, megjegyzes, afa) VALUES (26, 'Portaszolgálat', 'Egyetemi', 'óra', 10000, 12000, 15000, 18000, '', true);
INSERT INTO public.prices (id, megnevezes, kategoria, mertekegyseg, ar_egyetem, ar_egyetem_hetvege, ar_kulso, ar_kulso_hetvege, megjegyzes, afa) VALUES (27, 'Biztonsági terv, bejelentéshez szükséges dokumentáció elkészítése', 'Egyetemi', 'alkalom', 10000, 12000, 15000, 18000, '', true);
INSERT INTO public.prices (id, megnevezes, kategoria, mertekegyseg, ar_egyetem, ar_egyetem_hetvege, ar_kulso, ar_kulso_hetvege, megjegyzes, afa) VALUES (28, 'Csarnok szőnyegezése', 'Egyetemi', 'alkalom', 10000, 12000, 15000, 18000, '', true);
INSERT INTO public.prices (id, megnevezes, kategoria, mertekegyseg, ar_egyetem, ar_egyetem_hetvege, ar_kulso, ar_kulso_hetvege, megjegyzes, afa) VALUES (29, 'Háló leszedése alpintechnikával', 'Egyetemi', 'alkalom', 10000, 12000, 15000, 18000, '', true);
INSERT INTO public.prices (id, megnevezes, kategoria, mertekegyseg, ar_egyetem, ar_egyetem_hetvege, ar_kulso, ar_kulso_hetvege, megjegyzes, afa) VALUES (30, 'Székek bérlése', 'Egyetemi', 'db/alkalom', 10000, 12000, 15000, 18000, '', true);
INSERT INTO public.prices (id, megnevezes, kategoria, mertekegyseg, ar_egyetem, ar_egyetem_hetvege, ar_kulso, ar_kulso_hetvege, megjegyzes, afa) VALUES (31, 'Szemétszállítás - Konténer', 'Egyetemi', 'db', 10000, 12000, 15000, 18000, '', true);


--
-- Data for Name: role_audit; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.role_audit (id, user_id, neptun_code, old_role, new_role, changed_by, reason, changed_at) VALUES (1, 5, 'DA44ZT', 'Uni-Famulus', 'Főadmin', NULL, NULL, '2025-09-05 00:46:38.147891+02');
INSERT INTO public.role_audit (id, user_id, neptun_code, old_role, new_role, changed_by, reason, changed_at) VALUES (2, 5, 'DA44ZT', 'Főadmin', 'Főadmin', NULL, NULL, '2025-09-05 03:19:11.04369+02');
INSERT INTO public.role_audit (id, user_id, neptun_code, old_role, new_role, changed_by, reason, changed_at) VALUES (3, 1, 'C5YIYQ', 'Uni-Famulus', 'Főadmin', NULL, NULL, '2025-09-05 12:14:12.57559+02');
INSERT INTO public.role_audit (id, user_id, neptun_code, old_role, new_role, changed_by, reason, changed_at) VALUES (4, 1, 'C5YIYQ', 'Főadmin', 'Uni-Famulus', NULL, NULL, '2025-09-05 12:14:20.207104+02');
INSERT INTO public.role_audit (id, user_id, neptun_code, old_role, new_role, changed_by, reason, changed_at) VALUES (5, 5, 'DA44ZT', 'Főadmin', 'Admin', NULL, NULL, '2025-09-16 21:59:45.42193+02');
INSERT INTO public.role_audit (id, user_id, neptun_code, old_role, new_role, changed_by, reason, changed_at) VALUES (6, 1, 'C5YIYQ', 'Uni-Famulus', 'Főadmin', NULL, NULL, '2025-09-16 23:13:22.461817+02');
INSERT INTO public.role_audit (id, user_id, neptun_code, old_role, new_role, changed_by, reason, changed_at) VALUES (7, 1, 'C5YIYQ', 'Főadmin', 'Uni-Famulus', NULL, NULL, '2025-09-16 23:13:52.790117+02');
INSERT INTO public.role_audit (id, user_id, neptun_code, old_role, new_role, changed_by, reason, changed_at) VALUES (8, 13, 'ENPL82', 'Uni-Famulus', 'Admin', NULL, NULL, '2025-09-28 22:34:27.837426+02');
INSERT INTO public.role_audit (id, user_id, neptun_code, old_role, new_role, changed_by, reason, changed_at) VALUES (9, 14, 'ABCD12', 'Uni-Famulus', 'Rendezvényszervező', NULL, NULL, '2025-11-04 21:35:02.32268+01');


--
-- Data for Name: statusz; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.statusz (id, code, label, phase, terminal, sort_order, active, created_at, updated_at) VALUES (1, 'ARAJANLAT_KESZITES_FOLYAMATBAN', 'Árajánlat készítés folyamatban', 'BEERKEZETT', false, 10, true, '2025-09-09 02:09:29.123091+02', '2025-09-09 02:09:29.123091+02');
INSERT INTO public.statusz (id, code, label, phase, terminal, sort_order, active, created_at, updated_at) VALUES (2, 'UF_ARAJANLATRA_VAR', 'UF Árajánlatra vár', 'BEERKEZETT', false, 20, true, '2025-09-09 02:09:29.123091+02', '2025-09-09 02:09:29.123091+02');
INSERT INTO public.statusz (id, code, label, phase, terminal, sort_order, active, created_at, updated_at) VALUES (3, 'UF_ARAJANLAT_ELFOGADASARA_VAR', 'UF Árajánlat elfogadására vár', 'BEERKEZETT', false, 30, true, '2025-09-09 02:09:29.123091+02', '2025-09-09 02:09:29.123091+02');
INSERT INTO public.statusz (id, code, label, phase, terminal, sort_order, active, created_at, updated_at) VALUES (4, 'ARAJANLAT_KESZITESERE_VAR', 'Árajánlat készítésére vár', 'BEERKEZETT', false, 40, true, '2025-09-09 02:09:29.123091+02', '2025-09-09 02:09:29.123091+02');
INSERT INTO public.statusz (id, code, label, phase, terminal, sort_order, active, created_at, updated_at) VALUES (5, 'ARAJANLAT_ELFOGADASRA_VAR', 'Árajánlat elfogadásra vár', 'BEERKEZETT', false, 50, true, '2025-09-09 02:09:29.123091+02', '2025-09-09 02:09:29.123091+02');
INSERT INTO public.statusz (id, code, label, phase, terminal, sort_order, active, created_at, updated_at) VALUES (6, 'SZERZODES_ADATOKRA_VAR', 'Szerződés adatokra vár', 'SZERZODES', false, 110, true, '2025-09-09 02:09:29.123091+02', '2025-09-09 02:09:29.123091+02');
INSERT INTO public.statusz (id, code, label, phase, terminal, sort_order, active, created_at, updated_at) VALUES (7, 'SZERZODES_ATNEZESRE_VAR', 'Szerződés átnézésre vár', 'SZERZODES', false, 120, true, '2025-09-09 02:09:29.123091+02', '2025-09-09 02:09:29.123091+02');
INSERT INTO public.statusz (id, code, label, phase, terminal, sort_order, active, created_at, updated_at) VALUES (8, 'SZERZODES_KIKULDESRE_VAR', 'Szerződés kiküldésre vár', 'SZERZODES', false, 130, true, '2025-09-09 02:09:29.123091+02', '2025-09-09 02:09:29.123091+02');
INSERT INTO public.statusz (id, code, label, phase, terminal, sort_order, active, created_at, updated_at) VALUES (9, 'SZERZODES_PARTNERI_ALAIRASRA_VAR', 'Partneri aláírásra vár', 'SZERZODES', false, 140, true, '2025-09-09 02:09:29.123091+02', '2025-09-09 02:09:29.123091+02');
INSERT INTO public.statusz (id, code, label, phase, terminal, sort_order, active, created_at, updated_at) VALUES (10, 'SZERZODES_EGYETEMI_ALAIRASRA_VAR', 'Egyetemi aláírásra vár', 'SZERZODES', false, 150, true, '2025-09-09 02:09:29.123091+02', '2025-09-09 02:09:29.123091+02');
INSERT INTO public.statusz (id, code, label, phase, terminal, sort_order, active, created_at, updated_at) VALUES (11, 'SZERZODES_ALAIRVA', 'Szerződés aláírva', 'SZERZODES', false, 160, true, '2025-09-09 02:09:29.123091+02', '2025-09-09 02:09:29.123091+02');
INSERT INTO public.statusz (id, code, label, phase, terminal, sort_order, active, created_at, updated_at) VALUES (12, 'MEGVALOSITASRA_VAR', 'Megvalósításra vár', 'MEGVALOSITAS', false, 210, true, '2025-09-09 02:09:29.123091+02', '2025-09-09 02:09:29.123091+02');
INSERT INTO public.statusz (id, code, label, phase, terminal, sort_order, active, created_at, updated_at) VALUES (13, 'MEGVALOSULT_UF_IGAZOLASRA_VAR', 'Megvalósult - UF igazolásra vár', 'MEGVALOSITAS', false, 220, true, '2025-09-09 02:09:29.123091+02', '2025-09-09 02:09:29.123091+02');
INSERT INTO public.statusz (id, code, label, phase, terminal, sort_order, active, created_at, updated_at) VALUES (14, 'UF_TIG_JOVAHAGYASRA_VAR', 'UF TIG jóváhagyásra vár', 'ELSZAMOLAS', false, 310, true, '2025-09-09 02:09:29.123091+02', '2025-09-09 02:09:29.123091+02');
INSERT INTO public.statusz (id, code, label, phase, terminal, sort_order, active, created_at, updated_at) VALUES (15, 'ADATKOZLO_GENERALASRA_VAR', 'Adatközlő generálásra vár', 'ELSZAMOLAS', false, 320, true, '2025-09-09 02:09:29.123091+02', '2025-09-09 02:09:29.123091+02');
INSERT INTO public.statusz (id, code, label, phase, terminal, sort_order, active, created_at, updated_at) VALUES (16, 'ADATKOZLO_FELKULDVE', 'Adatközlő felküldve', 'ELSZAMOLAS', false, 330, true, '2025-09-09 02:09:29.123091+02', '2025-09-09 02:09:29.123091+02');
INSERT INTO public.statusz (id, code, label, phase, terminal, sort_order, active, created_at, updated_at) VALUES (17, 'LEZARVA', 'Lezárva', 'LEZART', true, 400, true, '2025-09-09 02:09:29.123091+02', '2025-09-09 02:09:29.123091+02');
INSERT INTO public.statusz (id, code, label, phase, terminal, sort_order, active, created_at, updated_at) VALUES (18, 'ELUTASITVA', 'Elutasítva', 'LEZART', true, 410, true, '2025-09-09 02:09:29.123091+02', '2025-09-09 02:09:29.123091+02');
INSERT INTO public.statusz (id, code, label, phase, terminal, sort_order, active, created_at, updated_at) VALUES (19, 'LEMONDVA', 'Lemondva', 'LEZART', true, 420, true, '2025-09-09 02:09:29.123091+02', '2025-09-09 02:09:29.123091+02');
INSERT INTO public.statusz (id, code, label, phase, terminal, sort_order, active, created_at, updated_at) VALUES (20, 'BEERKEZETT', 'Beérkezett', 'BEERKEZETT', false, 1, true, '2025-09-16 21:15:00.114773+02', '2025-09-16 21:15:00.114773+02');


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.users (id, email, password_hash, full_name, neptun_code, role, role_assigned_at, is_active, last_login, created_at, updated_at, avatar_url) VALUES (12, 'asdasd@gmail.com', '$2b$10$uojpcoFlyfF7FZHL7iC9Tu4BW.Z.9WQPYfaSFyXnrgGz.0yAnt1MO', 'valaki valaki', 'BD46GT', 'Uni-Famulus', NULL, true, NULL, '2025-09-09 01:47:01.330142+02', '2025-09-09 01:47:34.860336+02', '/uploads/anon-1757375254816.png');
INSERT INTO public.users (id, email, password_hash, full_name, neptun_code, role, role_assigned_at, is_active, last_login, created_at, updated_at, avatar_url) VALUES (5, 'example@gmail.com', '$2b$10$t7r9607yPdkK/BtEVM6Lp.mD4mTtUjy7XxIvJkdgT.5v9BilH5SD2', 'John Winchester', 'DA44ZT', 'Admin', '2025-09-16 21:59:45.417573+02', true, NULL, '2025-09-05 00:36:50.282286+02', '2025-09-16 23:06:39.587214+02', '/uploads/anon-1758056799541.png');
INSERT INTO public.users (id, email, password_hash, full_name, neptun_code, role, role_assigned_at, is_active, last_login, created_at, updated_at, avatar_url) VALUES (13, '21peti21@gmail.com', '$2b$10$YXqiT0xK.Z/S54gaDlByqOL1pKPfl7fSGMtdDSsTBVOTaLp.5rabm', 'Halász Péter', 'ENPL82', 'Admin', '2025-09-28 22:34:27.825694+02', true, NULL, '2025-09-28 22:34:17.162382+02', '2025-09-28 22:35:10.672849+02', NULL);
INSERT INTO public.users (id, email, password_hash, full_name, neptun_code, role, role_assigned_at, is_active, last_login, created_at, updated_at, avatar_url) VALUES (14, 'email@example.com', '$2b$10$JQE1ZabQSL4/DJkwKO2Yk.1xADvTrCl0lonezwpSMr5yh8u4pnAnm', 'Szexes János', 'ABCD12', 'Rendezvényszervező', '2025-11-04 21:35:02.317008+01', true, NULL, '2025-11-04 21:22:53.595375+01', '2025-11-04 22:01:01.156689+01', '/uploads/anon-1762290061150.jpg');
INSERT INTO public.users (id, email, password_hash, full_name, neptun_code, role, role_assigned_at, is_active, last_login, created_at, updated_at, avatar_url) VALUES (1, 'souris20013@gmail.com', '$2b$10$vkynwDelsRU5c7q7cFdoTe5TqmDqZ6P6g.wGhpx/lhZ1PkDAy/wPy', 'Haselberger Viktor', 'C5YIYQ', 'Uni-Famulus', '2025-09-16 23:13:52.786389+02', true, NULL, '2025-09-05 00:04:03.165597+02', '2025-11-04 22:01:40.282425+01', '/uploads/anon-1762290100141.png');


--
-- Name: kerveny_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.kerveny_id_seq', 14, true);


--
-- Name: kerveny_koltseg_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.kerveny_koltseg_id_seq', 115, true);


--
-- Name: prices_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.prices_id_seq', 13, true);


--
-- Name: role_audit_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.role_audit_id_seq', 9, true);


--
-- Name: statusz_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.statusz_id_seq', 20, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 14, true);


--
-- Name: kerveny_koltseg kerveny_koltseg_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kerveny_koltseg
    ADD CONSTRAINT kerveny_koltseg_pkey PRIMARY KEY (id);


--
-- Name: kerveny kerveny_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kerveny
    ADD CONSTRAINT kerveny_pkey PRIMARY KEY (id);


--
-- Name: prices prices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prices
    ADD CONSTRAINT prices_pkey PRIMARY KEY (id);


--
-- Name: role_audit role_audit_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_audit
    ADD CONSTRAINT role_audit_pkey PRIMARY KEY (id);


--
-- Name: statusz statusz_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.statusz
    ADD CONSTRAINT statusz_code_key UNIQUE (code);


--
-- Name: statusz statusz_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.statusz
    ADD CONSTRAINT statusz_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_neptun_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_neptun_code_key UNIQUE (neptun_code);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_kerveny_koltseg_kerveny_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_kerveny_koltseg_kerveny_id ON public.kerveny_koltseg USING btree (kerveny_id);


--
-- Name: idx_koltseg_kerveny_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_koltseg_kerveny_type ON public.kerveny_koltseg USING btree (kerveny_id, pricing_type);


--
-- Name: idx_koltseg_service_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_koltseg_service_id ON public.kerveny_koltseg USING btree (service_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_neptun; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_neptun ON public.users USING btree (neptun_code);


--
-- Name: users trg_users_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_users_set_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: role_audit fk_role_audit_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_audit
    ADD CONSTRAINT fk_role_audit_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: kerveny_koltseg kerveny_koltseg_kerveny_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.kerveny_koltseg
    ADD CONSTRAINT kerveny_koltseg_kerveny_id_fkey FOREIGN KEY (kerveny_id) REFERENCES public.kerveny(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

