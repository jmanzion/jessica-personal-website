BEGIN;

SET client_encoding = 'UTF8';

CREATE USER admin WITH PASSWORD 'datascience';

CREATE TABLE Faces (
    id integer NOT NULL,
    name text NOT NULL,
    path text NOT NULL
);

INSERT INTO Faces (id,name,path) VALUES (1,'subject 1','subject01.happy.gif');

ALTER TABLE ONLY Faces
    ADD CONSTRAINT faces_pkey PRIMARY KEY (id);

--ALTER TABLE ONLY country
    --ADD CONSTRAINT country_capital_fkey FOREIGN KEY (capital) REFERENCES city(id);

COMMIT;

ANALYZE Faces;