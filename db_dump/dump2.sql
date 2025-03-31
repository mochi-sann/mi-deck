--
-- PostgreSQL database cluster dump
--

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Drop databases (except postgres and template1)
--

DROP DATABASE mydb;




--
-- Drop roles
--

DROP ROLE postgres;


--
-- Roles
--

CREATE ROLE postgres;
ALTER ROLE postgres WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:AEMze8vnXHGa2E46yYQ1Uw==$ee0N1aJ8bDKzJRwkZPJy3T68vBbQJXLWDbnp8ymmF5Y=:J1wedmFz1YCnKKurft8OEqlRzNQwNviikt+zQ/iWhoM=';

--
-- User Configurations
--








--
-- Databases
--

--
-- Database "template1" dump
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4 (Debian 17.4-1.pgdg120+2)
-- Dumped by pg_dump version 17.4 (Debian 17.4-1.pgdg120+2)

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

UPDATE pg_catalog.pg_database SET datistemplate = false WHERE datname = 'template1';
DROP DATABASE template1;
--
-- Name: template1; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE template1 WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE template1 OWNER TO postgres;

\connect template1

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
-- Name: DATABASE template1; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON DATABASE template1 IS 'default template for new databases';


--
-- Name: template1; Type: DATABASE PROPERTIES; Schema: -; Owner: postgres
--

ALTER DATABASE template1 IS_TEMPLATE = true;


\connect template1

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
-- Name: DATABASE template1; Type: ACL; Schema: -; Owner: postgres
--

REVOKE CONNECT,TEMPORARY ON DATABASE template1 FROM PUBLIC;
GRANT CONNECT ON DATABASE template1 TO PUBLIC;


--
-- PostgreSQL database dump complete
--

--
-- Database "mydb" dump
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4 (Debian 17.4-1.pgdg120+2)
-- Dumped by pg_dump version 17.4 (Debian 17.4-1.pgdg120+2)

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
-- Name: mydb; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE mydb WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE mydb OWNER TO postgres;

\connect mydb

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: ServerType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."ServerType" AS ENUM (
    'Misskey',
    'OtherServer'
);


ALTER TYPE public."ServerType" OWNER TO postgres;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'USER'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: panel; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.panel (
    id text NOT NULL,
    server_session_id text NOT NULL,
    type text NOT NULL
);


ALTER TABLE public.panel OWNER TO postgres;

--
-- Name: server_info; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.server_info (
    id text NOT NULL,
    server_session_id text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    favicon_url text NOT NULL,
    icon_url text NOT NULL,
    name text NOT NULL,
    theme_color text NOT NULL
);


ALTER TABLE public.server_info OWNER TO postgres;

--
-- Name: server_session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.server_session (
    id text NOT NULL,
    user_id text NOT NULL,
    server_type public."ServerType" NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    origin text NOT NULL,
    server_token text NOT NULL
);


ALTER TABLE public.server_session OWNER TO postgres;

--
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id text NOT NULL,
    email text NOT NULL,
    name text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    password text NOT NULL,
    user_role public."UserRole" DEFAULT 'USER'::public."UserRole" NOT NULL
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- Name: user_info; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_info (
    id text NOT NULL,
    name text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL,
    server_s_ession_id text NOT NULL,
    "userId" text,
    username text NOT NULL,
    avater_url text NOT NULL
);


ALTER TABLE public.user_info OWNER TO postgres;

--
-- Name: user_setting; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_setting (
    id text NOT NULL,
    user_id text NOT NULL,
    key text NOT NULL,
    value text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(3) without time zone NOT NULL
);


ALTER TABLE public.user_setting OWNER TO postgres;

--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
27892f27-c71e-4d1a-b443-76d169151128	2d1200ba794660abd080d824706c9327482cbc7523260eab0f7fb1c0b89c06c6	2025-03-30 11:37:50.894776+00	20241208111216_init	\N	\N	2025-03-30 11:37:50.883127+00	1
e204de2a-21da-43fe-a1ff-b7820ee7be4f	645d4e66351c1c1443a2a35087c025323a0d71302aabe2082fc63b455ae4dce8	2025-03-30 11:37:51.042406+00	20241228110226_dleete_software_name_and_version	\N	\N	2025-03-30 11:37:51.035042+00	1
6ee3cc4c-89d9-489d-8d04-0477c0bda7f2	1f8eeba294af4088da7c61c3274dc1a73fc0d4611bc86ffad1b1fc2afdfa1441	2025-03-30 11:37:50.909111+00	20241208111440_update_text_case	\N	\N	2025-03-30 11:37:50.897447+00	1
9f3e8a80-272c-4bc0-b5dd-9c233afaa537	4024a786d41928134d0a1b6a71318b16d3f1dd3c85298088fde32ec5986bace4	2025-03-30 11:37:50.919744+00	20241208140618_update_user	\N	\N	2025-03-30 11:37:50.911657+00	1
cea50f20-e1b7-4f6c-abf8-9a1c9fdf2587	c8cc861d1f8f98a52ff735cc49a2441308a70851ff407cef7c8c0f264d6273ed	2025-03-30 11:37:50.930719+00	20241215095333_add_user_setting_model	\N	\N	2025-03-30 11:37:50.922411+00	1
93069863-6549-43c4-854b-8884431edc46	f8228c9dba39d5bffd9386a0c037f3981784e966b5233440a096c25868d67686	2025-03-30 11:37:50.94523+00	20241215095657_update_to_uuid	\N	\N	2025-03-30 11:37:50.933374+00	1
760f5e8c-8666-44a1-b225-5cb6e1db807d	87ec70ea629b47b03101290e6833fb1fcfc5fd5f03af58dfdffade3ce1f57cf2	2025-03-30 11:37:50.955443+00	20241215100813_add_user_type	\N	\N	2025-03-30 11:37:50.947777+00	1
69d960ce-5878-41cc-8e08-d6f086dc0d9e	4fbfe3e9c29f43efc09436e8ed44d8b7bc521b99fe563472675696aece8f928f	2025-03-30 11:37:50.966961+00	20241216101139_add_server_token	\N	\N	2025-03-30 11:37:50.958056+00	1
451c5495-8c74-4075-877c-fbaa6ce81eb9	b51f6d33141682c1985b913f02540ad1bbc9d25c3eb1e199973d0253dbcc0607	2025-03-30 11:37:50.978523+00	20241216150836_update_server_info	\N	\N	2025-03-30 11:37:50.969383+00	1
e25f3d41-778d-4dcf-a8c2-a3e2798b569c	c8ca10ab724e26a3ef7190cf7f8412ab52a0b043f28e6549a21089b14e38be4f	2025-03-30 11:37:50.989462+00	20241216151555_add_server_user_info	\N	\N	2025-03-30 11:37:50.98088+00	1
07e49465-a099-4093-a08f-7c67efa6bd4d	ca279f36b9bef197fcbc4244cb3ba42531e860041c38fdb16ceda865ff36bed0	2025-03-30 11:37:51.000514+00	20241216152202_	\N	\N	2025-03-30 11:37:50.992481+00	1
42546f69-fe8a-4bc6-84ed-667f46bb0de3	0412252e79c36d935e3b1983228d90033e69632e8574077bae9b9df508a214b8	2025-03-30 11:37:51.011048+00	20241216152451_add_username	\N	\N	2025-03-30 11:37:51.002919+00	1
44bf7bfd-8ed8-45cf-ac89-cf9169d7c534	6b594eeb9b2788095e63472c6665df168bde884b55346ceedadfe2168b7d3cde	2025-03-30 11:37:51.022455+00	20241216152652_icon_url_to_avater_url	\N	\N	2025-03-30 11:37:51.013766+00	1
e761b2ed-2ee0-49fa-aaa9-b56a720552cb	cb59bded0283e91e7dcaaaceabb9cf186a9c5fb0de52b038327c4befd45b19ee	2025-03-30 11:37:51.032691+00	20241228074337_add_index_to_userid	\N	\N	2025-03-30 11:37:51.024904+00	1
\.


--
-- Data for Name: panel; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.panel (id, server_session_id, type) FROM stdin;
\.


--
-- Data for Name: server_info; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.server_info (id, server_session_id, created_at, updated_at, favicon_url, icon_url, name, theme_color) FROM stdin;
a33eaca8-dda9-43ee-b58a-bc8b135ecb94	55ee61e8-819c-47de-a49d-823c1fdbed67	2025-03-30 13:48:57.669	2025-03-30 14:03:10.909	https://miiiiiiiii.mochi33.com//thumbnail-5388a32f-299c-4a0a-b398-571775bc6599.webp	https://misskey.mochi33.com/proxy/avatar.webp?url=https%3A%2F%2Fmiiiiiiiii.mochi33.com%09%2F%2Fbe7ff142-e534-4cb2-a376-1555207a4136.png&avatar=1	もちすきー	#2d3047
1a31fb0e-ebf6-4ca7-af49-04e423f32c06	f8895928-12d9-47e6-85a3-8de88aaaa7a8	2025-03-30 14:06:46.928	2025-03-30 15:14:47.65		https://example.tld/identicon/hoge@example.tld		
\.


--
-- Data for Name: server_session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.server_session (id, user_id, server_type, created_at, updated_at, origin, server_token) FROM stdin;
55ee61e8-819c-47de-a49d-823c1fdbed67	f8895928-12d9-47e6-85a3-8de88aaaa7a8	Misskey	2025-03-30 13:48:57.522	2025-03-30 13:48:57.522	https://misskey.mochi33.com	f8BrU9tMtId29Y8nlNRshibgxCxC4waN
f8895928-12d9-47e6-85a3-8de88aaaa7a8	f8895928-12d9-47e6-85a3-8de88aaaa7a8	Misskey	2025-03-30 13:57:17.963	2025-03-30 13:57:17.963	http://localhost:3002	PK00RQIpfmS1diD38HCzB1Pmz055BvFG
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (id, email, name, created_at, updated_at, password, user_role) FROM stdin;
f8895928-12d9-47e6-85a3-8de88aaaa7a8	example2@example.com	hoge	2025-03-30 11:37:58.294	2025-03-30 14:09:39.032	$2b$04$rSNIe86677Bgn8KSKo1nfuAMdD4pTerrBFCAbYKXS8HdSavvofE6S	ADMIN
\.


--
-- Data for Name: user_info; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_info (id, name, created_at, updated_at, server_s_ession_id, "userId", username, avater_url) FROM stdin;
9h0ivaeyi6	mochi	2025-03-30 13:48:57.522	2025-03-30 13:48:57.522	55ee61e8-819c-47de-a49d-823c1fdbed67	\N	mochi33i	https://misskey.mochi33.com/proxy/avatar.webp?url=https%3A%2F%2Fmiiiiiiiii.mochi33.com%09%2F%2Fbe7ff142-e534-4cb2-a376-1555207a4136.png&avatar=1
\.


--
-- Data for Name: user_setting; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_setting (id, user_id, key, value, created_at, updated_at) FROM stdin;
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: panel panel_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.panel
    ADD CONSTRAINT panel_pkey PRIMARY KEY (id);


--
-- Name: server_info server_info_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.server_info
    ADD CONSTRAINT server_info_pkey PRIMARY KEY (id);


--
-- Name: server_session server_session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.server_session
    ADD CONSTRAINT server_session_pkey PRIMARY KEY (id);


--
-- Name: user_info user_info_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_info
    ADD CONSTRAINT user_info_pkey PRIMARY KEY (id);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: user_setting user_setting_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_setting
    ADD CONSTRAINT user_setting_pkey PRIMARY KEY (id);


--
-- Name: panel_server_session_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX panel_server_session_id_idx ON public.panel USING btree (server_session_id);


--
-- Name: server_info_server_session_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX server_info_server_session_id_idx ON public.server_info USING btree (server_session_id);


--
-- Name: server_info_server_session_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX server_info_server_session_id_key ON public.server_info USING btree (server_session_id);


--
-- Name: server_session_origin_user_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX server_session_origin_user_id_key ON public.server_session USING btree (origin, user_id);


--
-- Name: server_session_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX server_session_user_id_idx ON public.server_session USING btree (user_id);


--
-- Name: user_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_email_key ON public."user" USING btree (email);


--
-- Name: user_info_server_s_ession_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_info_server_s_ession_id_idx ON public.user_info USING btree (server_s_ession_id);


--
-- Name: user_info_server_s_ession_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX user_info_server_s_ession_id_key ON public.user_info USING btree (server_s_ession_id);


--
-- Name: user_setting_user_id_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_setting_user_id_idx ON public.user_setting USING btree (user_id);


--
-- Name: panel panel_server_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.panel
    ADD CONSTRAINT panel_server_session_id_fkey FOREIGN KEY (server_session_id) REFERENCES public.server_session(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: server_info server_info_server_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.server_info
    ADD CONSTRAINT server_info_server_session_id_fkey FOREIGN KEY (server_session_id) REFERENCES public.server_session(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: server_session server_session_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.server_session
    ADD CONSTRAINT server_session_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: user_info user_info_server_s_ession_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_info
    ADD CONSTRAINT user_info_server_s_ession_id_fkey FOREIGN KEY (server_s_ession_id) REFERENCES public.server_session(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: user_info user_info_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_info
    ADD CONSTRAINT "user_info_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: user_setting user_setting_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_setting
    ADD CONSTRAINT user_setting_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

--
-- Database "postgres" dump
--

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4 (Debian 17.4-1.pgdg120+2)
-- Dumped by pg_dump version 17.4 (Debian 17.4-1.pgdg120+2)

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

DROP DATABASE postgres;
--
-- Name: postgres; Type: DATABASE; Schema: -; Owner: postgres
--

CREATE DATABASE postgres WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE postgres OWNER TO postgres;

\connect postgres

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
-- Name: DATABASE postgres; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON DATABASE postgres IS 'default administrative connection database';


--
-- PostgreSQL database dump complete
--

--
-- PostgreSQL database cluster dump complete
--

