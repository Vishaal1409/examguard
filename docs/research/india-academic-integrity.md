# Indian Academic Integrity, Examination Regulations & Privacy Compliance

**Author:** Shruthika (Frontend & Research Lead, ExamGuard Team)  
**Project:** ExamGuard — AI-Based Examination Malpractice Detection System  
**Date:** November 2026  
**Document Code:** EG-RES-2026-IND-01  

---

## 1. UGC Academic Integrity Regulations (2018)

### Official Legal Context
* **Full Title:** University Grants Commission (Promotion of Academic Integrity and Prevention of Plagiarism in Higher Educational Institutions) Regulations, 2018.
* **Notification Reference:** Notification No. F. 1-18/2010(CPP-II).
* **Date of UGC Notification:** July 23, 2018.
* **Publication in The Gazette of India:** July 31, 2018 (Extraordinary, Part III, Section 4).
* **Legal Source URL:** [UGC Official Gazette Notification (PDF)](https://www.ugc.gov.in/pdfnews/7771545_academic-integrity-Regulation2018.pdf)

### Purpose of the Regulations
The regulations were notified by the UGC under the powers conferred by clauses (f) and (g) of sub-section (1) of Section 26 of the University Grants Commission Act, 1956. The overarching objectives are:
1. To create academic awareness about responsible conduct of research, project work, assignment preparation, thesis writing, and academic submissions.
2. To establish institutional mechanisms through education, training, and ethical frameworks to prevent plagiarism.
3. To develop systems to detect plagiarism and prescribe standardized institutional mechanisms and penalties for students, faculty, and researchers.

### Similarity Levels and Thresholds
Under Regulation 6 and Regulation 12, similarity detected by anti-plagiarism tools is categorized into four distinct levels:

| Level | Similarity Threshold | Mandatory Penalty on Students (Theses / Dissertations) | Mandatory Penalty on Research Publications |
| :--- | :--- | :--- | :--- |
| **Level 0** | Up to 10% | **Minor similarities; no penalty.** | Minor similarities; no penalty. |
| **Level 1** | Above 10% to 40% | Student is required to submit a revised manuscript within a period not exceeding **6 months**. | Author is asked to withdraw the manuscript. |
| **Level 2** | Above 40% to 60% | Student is debarred from submitting a revised manuscript for a period of **1 year**. | Author is asked to withdraw manuscript; debarred from publishing for **1 year**; denied 1 annual increment. |
| **Level 3** | Above 60% | Student's registration for the degree program is **cancelled**. | Author is asked to withdraw manuscript; debarred from publishing for **2 years**; denied 2 successive annual increments. |

### Critical Exclusions from Similarity Checks (Regulation 7)
The regulations explicitly exclude the following from similarity percentage calculations:
* All quoted work reproduced with all necessary permissions and/or proper attribution.
* All references, bibliography, table of contents, preface, acknowledgments.
* All generic terms, laws, standard mathematical formulas, and common symbols.

### Relevance to ExamGuard
* **Similarity $\neq$ Plagiarism:** ExamGuard strictly follows the UGC principle that a mathematical similarity score is **not** definitive proof of plagiarism. Text analysis tools only report linguistic and semantic overlap; human examiners must independently determine whether common definitions, quotes, or legitimate group study explain the similarity.
* **Calibrated Risk Tiers:** ExamGuard's text analysis module mirrors the UGC tiered structure (Low Risk for &lt;70%, Medium Risk for 70%–84%, and High Risk for &ge;85%), allowing university examiners to quickly categorize answer cohorts for academic board review.

---

## 2. Public Examinations (Prevention of Unfair Means) Act, 2024

### Official Legal Context
* **Full Title:** The Public Examinations (Prevention of Unfair Means) Act, 2024 (Act No. 1 of 2024).
* **Enactment Date (Presidential Assent):** February 12, 2024.
* **Date of Operation (Gazette Notification):** June 21, 2024 (Notified under Section 1(2) by the Ministry of Personnel, Public Grievances and Pensions, Department of Personnel and Training).
* **Legal Source URL:** [The Gazette of India — Act No. 1 of 2024](https://www.indiacode.nic.in/handle/123456789/21808) | [Ministry Gazette Notification of Enforcement](https://dopt.gov.in/)

### Purpose and Scope of the Act
The Act was introduced by the Union Government to establish a comprehensive, central criminal legal framework to deter and punish organized syndicates, paper leakers, service providers, and corrupt officials who undermine the integrity of public recruitment and entrance examinations conducted by central authorities, including:
* National Testing Agency (NTA)
* Union Public Service Commission (UPSC)
* Staff Selection Commission (SSC)
* Railway Recruitment Boards (RRBs)
* Institute of Banking Personnel Selection (IBPS)

### Specific Unfair Means Addressed (Section 3)
The Act codifies a comprehensive statutory definition of examination malpractice:
1. **Paper & Key Leakage:** Unauthorized leaking or procuring question papers or answer keys before or during the examination.
2. **Unauthorized Electronic Assistance:** Assisting candidates directly or indirectly via unauthorized communication devices (mobile handsets, hidden earphones, smartwatches, Bluetooth transceivers).
3. **Computer & Network Tampering:** Hacking, intercepting, or manipulating examination computer terminals, local servers, surveillance cameras, or network firewalls.
4. **Impersonation:** Creating dummy candidates or manipulating biometric attendance records.
5. **Organized Cheating Rackets:** Running dummy exam centers, solving exam papers offsite, or using electronic transmission rings.

### Severe Penalties and Legal Nature of Offences
* **Cognizable and Non-Bailable:** All offences under the Act are cognizable, non-bailable, and non-compoundable (Section 9).
* **Individual Perpetrators:** Imprisonment of **3 to 5 years** and a fine of up to **₹10 lakh**.
* **Organized Examination Syndicates:** Imprisonment of **5 to 10 years** and a fine of not less than **₹1 crore**.
* **Service Providers / Institutional Testing Centers:** Fines up to **₹1 crore**, recovery of examination expenses, and a **4-year institutional ban** on conducting public examinations.

### Relevance to ExamGuard
* The Act demonstrates that examination security in India has shifted from simple disciplinary infractions to criminal liability.
* By providing auditable, tamper-resistant frame-by-frame event logs (such as phone detection and looking sideways), ExamGuard equips educational institutions with evidentiary trails that can withstand institutional and legal scrutiny.

---

## 3. Credible Examination Integrity Incidents in India (2024)

### Case 1: NEET-UG 2024 Malpractice Incident
* **Examination Date:** May 5, 2024 (Over 24 lakh medical aspirants across 4,750 examination centers).
* **Conducting Agency:** National Testing Agency (NTA).
* **Incident Summary:** Widespread public outcry arose in June 2024 following anomalous scoring patterns (67 students scoring a perfect 720/720) and allegations of pre-exam paper leaks. State police investigations in Patna (Bihar) and Godhra (Gujarat) recovered burnt remains of leaked question papers and identified organized solver rings who used unauthorized communication devices to transmit answers.
* **Government Action:**
  * The Ministry of Education handed over the investigation to the **Central Bureau of Investigation (CBI)** on June 22, 2024.
  * Multiple FIRs were registered under sections of the Indian Penal Code and the Public Examinations (Prevention of Unfair Means) Act, 2024.
  * The Supreme Court of India conducted extensive hearings (*Vanshika Shukla v. NTA* and connected petitions, July 2024), establishing the National Committee of Experts led by former ISRO Chief Dr. K. Radhakrishnan to overhaul NTA exam protocols, CCTV surveillance, and digital integrity checks.
* **Official Reference:** [Press Information Bureau (PIB) Release on NEET-UG Investigation](https://pib.gov.in/PressReleasePage.aspx?PRID=2028045)

### Case 2: UGC-NET June 2024 Cancellation
* **Examination Date:** June 18, 2024 (Conducted in pen-and-paper OMR mode across 1,205 centers in 317 cities for 9,08,580 candidates).
* **Conducting Agency:** National Testing Agency (NTA).
* **Cancellation Date:** June 19, 2024 (Cancelled within 24 hours of completion).
* **Incident Summary:** The Ministry of Education received high-priority threat intelligence from the **National Cyber Crime Threat Analytics Unit (NCTAU)** of the Indian Cyber Crime Coordination Centre (I4C) under the Ministry of Home Affairs (MHA), indicating that the UGC-NET question paper had been compromised and was circulating on encrypted channels (Telegram and Dark Web forums) prior to the exam.
* **Government Action:**
  * To uphold the highest level of transparency and sanctity of the examination, the Ministry of Education immediately cancelled the test and referred the matter to the CBI for a comprehensive criminal investigation.
  * The examination was subsequently restructured and re-conducted in August–September 2024 exclusively in Computer-Based Test (CBT) format with enhanced digital monitoring.
* **Official Reference:** [Ministry of Education Official Press Release (June 19, 2024)](https://pib.gov.in/PressReleasePage.aspx?PRID=2026887)

---

## 4. Digital Personal Data Protection Act, 2023 & DPDP Rules, 2025

### Official Statutory Context
* **Full Title:** The Digital Personal Data Protection Act, 2023 (Act No. 22 of 2023).
* **Date of Enactment (Presidential Assent):** August 11, 2023.
* **Operational Framework:** The **DPDP Rules, 2025** were formally notified by the Ministry of Electronics and Information Technology (MeitY) on **November 14, 2025**.
* **Legal Source URL:** [The Gazette of India — DPDP Act No. 22 of 2023](https://www.meity.gov.in/content/digital-personal-data-protection-act-2023) | [MeitY DPDP Portal](https://www.meity.gov.in/)

### Clarification on Phased Implementation
> [!IMPORTANT]
> The DPDP Act, 2023 **did not** become fully operational immediately upon receiving Presidential assent in August 2023. The Central Government utilized a structured phased commencement framework under Section 1(2):
> * **Phase 1 (November 14, 2025):** Immediate establishment and empowerment of the **Data Protection Board of India (DPBI)**, defining its adjudicatory mechanisms and inquiry procedures.
> * **Phase 2 (November 13, 2026 — 12-Month Runway):** Mandatory compliance for **Consent Managers**, including technical interoperability standards and formal DPBI registration.
> * **Phase 3 (May 13, 2027 — 18-Month Runway):** Full-scale substantive obligations for all **Data Fiduciaries**, including strict notice presentation, verifiable parental consent for children, and automated data erasure routines.

### Core Data Protection Principles Applied to ExamGuard

ExamGuard processes sensitive student identifiers, candidate webcam feeds, and subjective answer submissions. Under the DPDP Act 2023, the educational institution acts as a **Data Fiduciary**, and ExamGuard acts as a **Data Processor**:

#### A. Notice & Lawful Consent (Sections 5 & 6)
* Before analyzing examination footage, students must receive clear, itemized notice in plain language describing exactly what data is evaluated (head pose and mobile handset detection).
* Consent must be freely given, specific, informed, and unconditional.

#### B. Purpose Limitation & Data Minimisation (Sections 4 & 6)
* Data can only be processed for the specific purpose of proctoring and academic review.
* **ExamGuard Implementation:** In strict adherence to data minimisation, ExamGuard **does not store raw video recordings** on server disks. Video streams are decoded in temporary volatile memory to extract discrete behavioral coordinates (`looking_sideways`, `phone_use`) and timestamps. The raw video is purged immediately once frames are sampled.

#### C. Reasonable Security Safeguards (Section 8(5))
* Data Fiduciaries must implement appropriate technical and operational security measures to prevent data breaches.
* ExamGuard enforces JWT bearer authentication, encrypted HTTPS transport, and role-based access control (only authorized examiners can inspect audit logs).

#### D. Data Retention and Erasure (Section 8(7))
* Personal data must not be retained once the purpose for which it was collected has been served.
* ExamGuard retains only lightweight audit metadata (session ID, event timestamps, examiner confirm/dismiss status) for the duration of the institutional appeal window, ensuring automated compliance with statutory erasure rights.

#### E. Individual Data Rights (Chapter III)
* Students (Data Principals) possess the right to access a summary of processed personal data, the right to correction and erasure, and the right to grievance redressal before the institutional review board.
* Because ExamGuard preserves the human-in-the-loop audit trail, students facing flagged anomalies can be shown the exact timestamp in question during an in-person grievance hearing, upholding fundamental natural justice.

---

## 5. Summary: Why Compliance Matters for ExamGuard Architecture

| Requirement | Regulatory Driver | ExamGuard Day 1 Design Response |
| :--- | :--- | :--- |
| **No Automated Accusations** | UGC Regulations 2018 & Natural Justice | AI only flags events; examiner clicks **Confirm** or **Dismiss**. |
| **Zero Raw Video Retention** | DPDP Act 2023 (Data Minimisation) | In-memory frame evaluation; temporary upload deleted immediately. |
| **Tamper-Evident Incident Logs** | Public Examinations Act 2024 | Exact timestamps, confidence percentages, and duration logging. |
| **Similarity $\neq$ Plagiarism** | UGC 2018 Threshold Levels | Semantic matching presents sentence pairs for human contextual appraisal. |
| **Lightweight Browser Accessibility** | Digital Equality & Non-Discrimination | Zero invasive desktop installers; works on standard modern web browsers. |
