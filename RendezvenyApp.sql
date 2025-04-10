CREATE DATABASE "RendezvenyApp"
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'hu-HU'
    LC_CTYPE = 'hu-HU'
    LOCALE_PROVIDER = 'libc'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

CREATE TABLE IF NOT EXISTS public.statusz
(
    id integer,
    statusz character varying(50) COLLATE pg_catalog."default", -- Max 50 karakter
    CONSTRAINT statusz_pkey PRIMARY KEY (id)
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."statusz"
    OWNER to postgres;

-- Alapértelmezett státuszok beszúrása
INSERT INTO public.statusz (id, statusz) VALUES
(0, 'Feldolgozás alatt'), -- Új státusz hozzáadása
(1, 'Elfogadásra vár'),
(2, 'Elfogadva'),
(3, 'Elutasítva')
ON CONFLICT (id) DO NOTHING; -- Elkerüli a duplikált beszúrást, ha már léteznek az értékek

CREATE TABLE IF NOT EXISTS public.kerveny
(
    id integer GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    nev character varying(100) COLLATE pg_catalog."default",
    leiras character varying(500) COLLATE pg_catalog."default",
    helyszin character varying(150) COLLATE pg_catalog."default",
    cim character varying(200) COLLATE pg_catalog."default",
    kezdo_datum timestamp without time zone,
    veg_datum timestamp without time zone,
    kezdo_idopont time without time zone,
    veg_idopont time without time zone,
    tipus character varying(50) COLLATE pg_catalog."default",
    minosites character varying(50) COLLATE pg_catalog."default",
    sajto boolean,
    jelleg character varying(100) COLLATE pg_catalog."default",
    programterv character varying(1000) COLLATE pg_catalog."default",
    berendezesi_mod character varying(500) COLLATE pg_catalog."default",
    szallasigeny boolean,
    szallasigeny_letszam integer,
    parkolo boolean,
    parkolo_reszletek character varying(300) COLLATE pg_catalog."default",
    internet boolean,
    hulladek boolean,
    hulladek_elszallitas_modja character varying(50) COLLATE pg_catalog."default",
    hulladek_elszallitas_felelos character varying(100) COLLATE pg_catalog."default",
    letszam integer,
    statusz integer DEFAULT 0, -- Alapértelmezett érték 0
    email character varying(100) COLLATE pg_catalog."default",
    telefon character varying(20) COLLATE pg_catalog."default",
    oktatastechnika boolean,
    oktatas_eszkozok character varying(300) COLLATE pg_catalog."default",
    korlatozott_mozgas boolean,
    korlatozott_mozgas_reszletek character varying(300) COLLATE pg_catalog."default",
    foto boolean,
    foto_reszletek character varying(300) COLLATE pg_catalog."default",
    cater boolean,
    catering_tipus character varying(300) COLLATE pg_catalog."default",
    epites boolean,
    epites_kezdet timestamp without time zone,
    epites_veg timestamp without time zone,
    epites_vallalkozok character varying(200) COLLATE pg_catalog."default",
    epites_magas boolean,
    epites_allvany boolean,
    epites_kezi boolean,
    epites_gepi boolean,
    takaritas boolean,
    takaritas_alatt boolean,
    villanyszerelo character varying(50) COLLATE pg_catalog."default",
    aramigeny character varying(50) COLLATE pg_catalog."default",
    leg_szennyezes character varying(50) COLLATE pg_catalog."default",
    egyeb_tevekenyseg character varying(300) COLLATE pg_catalog."default",
    vegyi_anyag boolean,
    vegyi_anyag_leiras character varying(300) COLLATE pg_catalog."default",
    tuzveszelyes_tevekenyseg boolean,
    tuzveszelyes_tevekenyseg_leiras character varying(300) COLLATE pg_catalog."default",
    dekoracio boolean,
    dekoracio_leiras character varying(300) COLLATE pg_catalog."default",
    felelos character varying(100) COLLATE pg_catalog."default",
    lakcim character varying(200) COLLATE pg_catalog."default",
    tovabbi_szervezo character varying(100) COLLATE pg_catalog."default",
    tovabbi_telefon character varying(20) COLLATE pg_catalog."default",
    tovabbi_email character varying(100) COLLATE pg_catalog."default",
    tovabbi_neptun character varying(6) COLLATE pg_catalog."default",
    tovabbi_lakcim character varying(200) COLLATE pg_catalog."default",
    megrendelo_nev character varying(100) COLLATE pg_catalog."default",
    megrendelo_cim character varying(200) COLLATE pg_catalog."default",
    megrendelo_ado character varying(15) COLLATE pg_catalog."default",
    megrendelo_telefon character varying(20) COLLATE pg_catalog."default",
    megrendelo_email character varying(100) COLLATE pg_catalog."default",
    portaszolgalat boolean,
    portaszolgalat_leiras character varying(300) COLLATE pg_catalog."default",
    CONSTRAINT kerveny_pkey PRIMARY KEY (id),
    CONSTRAINT "statuszFk" FOREIGN KEY (statusz)
        REFERENCES public.statusz (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."kerveny"
    OWNER to postgres;