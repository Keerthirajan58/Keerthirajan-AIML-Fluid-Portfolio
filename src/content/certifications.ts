import type { Certification } from "./types";

const logo = (name: string) => `/images/brands/certs/${name}.png`;

/** Shown in this order. Logo provenance: THIRD_PARTY_NOTICES.md. */
export const certifications: Certification[] = [
  {
    title: "Machine Learning",
    issuer: "Stanford University",
    url: "https://www.coursera.org/account/accomplishments/verify/LBWAGV269YVH",
    logo: logo("stanford"),
  },
  {
    // Issued through ICT Academy's IBM Skills Network portal.
    title: "IBM Certified Project",
    issuer: "ICT Academy",
    url: "https://courses.ictacademy.skillsnetwork.site/certificates/3a37a247baa4474f8733a86a24e2cb12",
    logo: logo("ibm"),
  },
  {
    title: "Web Development",
    issuer: "UC Davis",
    url: "https://coursera.org/verify/T7H86R7HML9R",
    logo: logo("ucdavis"),
  },
  {
    title: "Programming Foundations",
    issuer: "Duke University",
    url: "https://coursera.org/verify/98YLYAJQUXZY",
    logo: logo("duke"),
  },
  {
    title: "Relational DB and SQL",
    issuer: "Coursera",
    url: "https://coursera.org/verify/MB2V55ZDEUFW",
    logo: logo("coursera"),
  },
  {
    // The owner's LinkedIn certifications list links through to the certificate.
    title: "API Designer",
    issuer: "API Academy",
    url: "https://www.linkedin.com/in/keerthirajans58/details/certifications/",
    logo: logo("api-academy"),
  },
  {
    title: "AI Event Project",
    issuer: "GUVI AI event",
    url: "https://www.guvi.in/verify-certificate?id=1O17U19P26900xipwo",
    logo: logo("guvi"),
  },
  {
    // The NPTEL portal; confirmed by the owner.
    title: "Programming in Java",
    issuer: "IIT Kharagpur NPTEL",
    url: "https://nptel.ac.in/noc",
    logo: logo("nptel"),
  },
  {
    title: "PHP and MySQL",
    issuer: "Udemy",
    url: "https://www.linkedin.com/in/keerthirajans58/details/certifications/",
    logo: logo("udemy"),
  },
];
