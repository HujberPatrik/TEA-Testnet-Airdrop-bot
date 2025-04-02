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
    id integer NOT NULL,
    statusz character varying COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT statusz_pkey PRIMARY KEY (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."statusz"
    OWNER to postgres;

CREATE TABLE IF NOT EXISTS public.kerveny
(
    id integer NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1 ),
    nev character varying(30) COLLATE pg_catalog."default" NOT NULL,
    statusz integer NOT NULL,
    kezdo_datum timestamp without time zone NOT NULL,
    helyszin character varying(20) COLLATE pg_catalog."default" NOT NULL,
    letszam integer NOT NULL,
    email character varying(30) COLLATE pg_catalog."default" NOT NULL,
    telefonszam character varying(12) COLLATE pg_catalog."default" NOT NULL,
    leiras character varying(300) COLLATE pg_catalog."default" NOT NULL,
    cim character varying(100) COLLATE pg_catalog."default" NOT NULL,
    veg_datum timestamp without time zone NOT NULL,
    tipus character varying(30) COLLATE pg_catalog."default" NOT NULL,
    minosites character varying(20) COLLATE pg_catalog."default" NOT NULL,
    sajto boolean NOT NULL,
    jelleg character varying(30) COLLATE pg_catalog."default" NOT NULL,
    programterv character varying(400) COLLATE pg_catalog."default" NOT NULL,
    berendezesi_mod character varying(400) COLLATE pg_catalog."default",
    szallasigeny character varying(20) COLLATE pg_catalog."default" NOT NULL,
    parkolo character varying(20) COLLATE pg_catalog."default" NOT NULL,
    internet character varying(20) COLLATE pg_catalog."default" NOT NULL,
    oktatastechnika character varying(50) COLLATE pg_catalog."default" NOT NULL,
    korlatozott_mozgas boolean NOT NULL,
    foto character varying(50) COLLATE pg_catalog."default" NOT NULL,
    cater character varying(50) COLLATE pg_catalog."default" NOT NULL,
    epites boolean NOT NULL,
    epites_kezdet timestamp without time zone,
    epites_veg timestamp without time zone,
    epites_vallalkozok character varying(100) COLLATE pg_catalog."default",
    epites_magas boolean,
    epites_allvany boolean,
    epites_kezi boolean,
    epites_gepi boolean,
    takaritas boolean NOT NULL,
    villanyszerelo character varying(30) COLLATE pg_catalog."default" NOT NULL,
    aramigeny character varying(50) COLLATE pg_catalog."default" NOT NULL,
    leg_szennyezes character varying(30) COLLATE pg_catalog."default" NOT NULL,
    vegyi_anyag character varying(40) COLLATE pg_catalog."default" NOT NULL,
    dekoracio boolean NOT NULL,
    felelos character varying(40) COLLATE pg_catalog."default" NOT NULL,
    lakcim character varying(100) COLLATE pg_catalog."default" NOT NULL,
    tovabbi_szervezo character varying(100) COLLATE pg_catalog."default" NOT NULL,
    tovabbi_telefon character varying(20) COLLATE pg_catalog."default",
    tovabbi_email character varying(50) COLLATE pg_catalog."default",
    tovabbi_neptun character varying(6) COLLATE pg_catalog."default",
    tovabbi_lakcim character varying(100) COLLATE pg_catalog."default",
    megrendelo_nev character varying(40) COLLATE pg_catalog."default",
    megrendelo_cim character varying(100) COLLATE pg_catalog."default",
    megrendelo_ado character varying(20) COLLATE pg_catalog."default",
    megrendelo_telefon character varying(20) COLLATE pg_catalog."default",
    megrendelo_email character varying(50) COLLATE pg_catalog."default",
    CONSTRAINT kerveny_pkey PRIMARY KEY (id),
    CONSTRAINT "statuszFk" FOREIGN KEY (statusz)
        REFERENCES public.statusz (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."kerveny"
    OWNER to postgres;