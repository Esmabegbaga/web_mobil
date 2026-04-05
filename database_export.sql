--
-- PostgreSQL database dump
--

\restrict ghDLFVhMt3JnEUGwgOFQbydUVtlWKwm8sSwPMokqvhCRNDnENhvxNVOmXcSvW84

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: announcements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.announcements (
    id integer NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    club_id integer,
    is_global boolean DEFAULT false NOT NULL,
    author_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: announcements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.announcements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: announcements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.announcements_id_seq OWNED BY public.announcements.id;


--
-- Name: clubs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clubs (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    category text,
    logo_url text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: clubs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.clubs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: clubs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.clubs_id_seq OWNED BY public.clubs.id;


--
-- Name: event_reactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event_reactions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    event_id integer NOT NULL,
    type text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: event_reactions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.event_reactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: event_reactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.event_reactions_id_seq OWNED BY public.event_reactions.id;


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    category text,
    location text,
    image_url text,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone,
    status text DEFAULT 'pending'::text NOT NULL,
    club_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    role text DEFAULT 'student'::text NOT NULL,
    student_id text,
    department text,
    avatar_url text,
    is_active boolean DEFAULT true NOT NULL,
    club_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
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
-- Name: announcements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements ALTER COLUMN id SET DEFAULT nextval('public.announcements_id_seq'::regclass);


--
-- Name: clubs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clubs ALTER COLUMN id SET DEFAULT nextval('public.clubs_id_seq'::regclass);


--
-- Name: event_reactions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_reactions ALTER COLUMN id SET DEFAULT nextval('public.event_reactions_id_seq'::regclass);


--
-- Name: events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.announcements (id, title, content, club_id, is_global, author_id, created_at, updated_at) FROM stdin;
1	Kampüs Online Platforma Hoş Geldiniz!	Campus Online platformu artık aktif. Etkinlikleri takip edin, kulüplere katılın ve kampüs hayatının bir parçası olun.	\N	t	1	2026-04-05 15:52:38.109428+00	2026-04-05 15:52:38.109428+00
2	Hackathon Kayıtları Açıldı	Yazılım Geliştirme Kulübü olarak düzenlediğimiz Hackathon 2025 için kayıtlar başladı. Ekibinizi oluşturun ve kayıt olun!	1	f	4	2026-04-05 15:52:38.109428+00	2026-04-05 15:52:38.109428+00
3	Bahar Konseri Biletleri	Bahar Konserimiz için biletler sınırlı sayıda mevcuttur. Erken kayıt için kulüp ofisimize gelin.	2	f	5	2026-04-05 15:52:38.109428+00	2026-04-05 15:52:38.109428+00
\.


--
-- Data for Name: clubs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.clubs (id, name, description, category, logo_url, created_at, updated_at) FROM stdin;
1	Yazılım Geliştirme Kulübü	Yazılım, programlama ve teknoloji etkinlikleri düzenleyen kulüp	Teknoloji	\N	2026-04-05 15:52:25.977472+00	2026-04-05 15:52:25.977472+00
2	Müzik Kulübü	Konserler, workshoplar ve müzik etkinlikleri düzenleyen kulüb	Sanat	\N	2026-04-05 15:52:25.977472+00	2026-04-05 15:52:25.977472+00
3	Spor Kulübü	Futbol, basketbol ve diğer spor etkinlikleri	Spor	\N	2026-04-05 15:52:25.977472+00	2026-04-05 15:52:25.977472+00
4	Fotoğrafçılık Kulübü	Fotoğraf çekimi ve düzenleme workshopları	Sanat	\N	2026-04-05 15:52:25.977472+00	2026-04-05 15:52:25.977472+00
5	Girişimcilik Kulübü	Startuplar, yatırım ve girişimcilik etkinlikleri	İş	\N	2026-04-05 15:52:25.977472+00	2026-04-05 15:52:25.977472+00
\.


--
-- Data for Name: event_reactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.event_reactions (id, user_id, event_id, type, created_at) FROM stdin;
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.events (id, title, description, category, location, image_url, start_date, end_date, status, club_id, created_at, updated_at) FROM stdin;
1	Hackathon 2025	24 saatlik yazılım geliştirme yarışması. Tüm öğrencilere açık!	Teknoloji	A Blok Konferans Salonu	\N	2026-04-08 15:52:34.314109+00	2026-04-09 15:52:34.314109+00	approved	1	2026-04-05 15:52:34.314109+00	2026-04-05 15:52:34.314109+00
2	Bahar Konseri	Müzik kulübümüzün yıllık bahar konseri. Çeşitli türlerde müzik performansları.	Müzik	Açık Hava Amfitiyatrosu	\N	2026-04-10 15:52:34.314109+00	2026-04-10 18:52:34.314109+00	approved	2	2026-04-05 15:52:34.314109+00	2026-04-05 15:52:34.314109+00
3	Futbol Turnuvası	Kulüpler arası futbol turnuvası. Takımlar kayıt olabilir.	Spor	Üniversite Spor Sahası	\N	2026-04-12 15:52:34.314109+00	2026-04-12 23:52:34.314109+00	approved	3	2026-04-05 15:52:34.314109+00	2026-04-05 15:52:34.314109+00
4	Fotoğraf Sergisi	Öğrencilerin çektiği fotoğraflardan oluşan sergi.	Sanat	Kütüphane Fuayesi	\N	2026-04-07 15:52:34.314109+00	2026-04-14 15:52:34.314109+00	approved	4	2026-04-05 15:52:34.314109+00	2026-04-05 15:52:34.314109+00
5	Startup Pitch Night	Öğrenci girişimcilerin projelerini yatırımcılara sunduğu gece.	İş	B Blok Seminer Salonu	\N	2026-04-15 15:52:34.314109+00	\N	approved	5	2026-04-05 15:52:34.314109+00	2026-04-05 15:52:34.314109+00
6	Python Workshop	Başlangıç seviyesi Python programlama kursu.	Teknoloji	Bilgisayar Laboratuvarı 1	\N	2026-04-06 15:52:34.314109+00	2026-04-06 18:52:34.314109+00	pending	1	2026-04-05 15:52:34.314109+00	2026-04-05 15:52:34.314109+00
7	Kariyer Günleri	Şirketlerle networking etkinliği	Kariyer	Ana Aula	\N	2026-04-19 15:52:34.314109+00	\N	approved	1	2026-04-05 15:52:34.314109+00	2026-04-05 15:52:34.314109+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, email, password_hash, role, student_id, department, avatar_url, is_active, club_id, created_at, updated_at) FROM stdin;
1	Admin	admin@campusonline.edu	3200269f809109d16f5ae8d24dda2ca0cf6534897d14a7d9f1fe3534fb2b97b1	admin	\N	\N	\N	t	\N	2026-04-05 15:52:30.390061+00	2026-04-05 15:52:30.390061+00
2	Ahmet Yılmaz	ahmet@campusonline.edu	da11ca39851a0a8c2e52abfa43a95b82643c88d8dc0f782ed771e8ef106c3de8	student	20210001	Bilgisayar Mühendisliği	\N	t	\N	2026-04-05 15:52:30.390061+00	2026-04-05 15:52:30.390061+00
3	Zeynep Kaya	zeynep@campusonline.edu	da11ca39851a0a8c2e52abfa43a95b82643c88d8dc0f782ed771e8ef106c3de8	student	20210002	Elektrik Mühendisliği	\N	t	\N	2026-04-05 15:52:30.390061+00	2026-04-05 15:52:30.390061+00
4	Mehmet Demir	mehmet@campusonline.edu	d68a3739312898fa9af4fd00d154d8c68ca14ab9399c87e4596ed2e90f1d2c1a	club_official	20200005	Bilgisayar Mühendisliği	\N	t	1	2026-04-05 15:52:30.390061+00	2026-04-05 15:52:30.390061+00
5	Ayşe Çelik	ayse@campusonline.edu	d68a3739312898fa9af4fd00d154d8c68ca14ab9399c87e4596ed2e90f1d2c1a	club_official	20200006	Müzik	\N	t	2	2026-04-05 15:52:30.390061+00	2026-04-05 15:52:30.390061+00
\.


--
-- Name: announcements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.announcements_id_seq', 3, true);


--
-- Name: clubs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.clubs_id_seq', 5, true);


--
-- Name: event_reactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.event_reactions_id_seq', 1, false);


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.events_id_seq', 7, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 5, true);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: clubs clubs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clubs
    ADD CONSTRAINT clubs_pkey PRIMARY KEY (id);


--
-- Name: event_reactions event_reactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_reactions
    ADD CONSTRAINT event_reactions_pkey PRIMARY KEY (id);


--
-- Name: event_reactions event_reactions_user_id_event_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event_reactions
    ADD CONSTRAINT event_reactions_user_id_event_id_unique UNIQUE (user_id, event_id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

\unrestrict ghDLFVhMt3JnEUGwgOFQbydUVtlWKwm8sSwPMokqvhCRNDnENhvxNVOmXcSvW84

