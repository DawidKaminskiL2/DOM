# LibraryLite - System Zarządzania Biblioteką

### 1. Uruchomienie i Konteneryzacja
* Projekt jest w pełni skonteneryzowany i zarządzany za pomocą Docker Compose. 
* Architektura składa się z 7 współpracujących usług, co zapewnia pełną izolację środowiska.
* **Uruchomienie**: System wstaje po wydaniu jednej komendy: `docker compose up -d`.
* **Zarządzanie**: Usługi takie jak projekt-backend czy projekt-frontend są budowane z lokalnych źródeł przy użyciu zoptymalizowanych obrazów bazowych (alpine, slim).
* **Wersjonowanie**: Obrazy są tagowane konkretnymi wersjami (np. v1.0.10).

![Widok kontenerów](1.PNG)

---

### 2. Architektura i Baza Danych
* **Backend (FastAPI)**: Odpowiada wyłącznie za logikę biznesową i udostępnianie danych przez API.
* **PostgreSQL**: Zastosowano bazę danych Postgres zamiast SQLite. 
* **Persystencja**: Dane są bezpieczne dzięki wolumenom Dockera (postgres_data).
* **Adminer**: Narzędzie webowe pozwalające na bezpośredni wgląd i edycję danych w bazie pod portem 8081.

![Baza danych](2.PNG)

---

### 3. Autoryzacja i Edycja Danych
* Edycja zasobów bibliotecznych jest dostępna wyłącznie dla zalogowanych użytkowników. 
* Wykorzystujemy autoryzację Basic Auth zintegrowaną z bazą danych.
* **Weryfikacja**: Zapytania modyfikujące dane (POST/PUT/DELETE) wymagają poprawnego zweryfikowania użytkownika.

![Ekran logowania](7.PNG)
![Interfejs aplikacji](6.PNG)

---

### 4. Cykl Rozwojowy CI/CD
* Projekt jest rozwijany systematycznie z wykorzystaniem narzędzi Git i GitHub Actions.
* **Workflows**: Zaimplementowano dwa potoki:
    * **CI (Continuous Integration)**: Automatyczny linting kodu oraz testy sprawdzające stabilność aplikacji przy każdym Pull Requeście.
    * **CD (Continuous Deployment)**: Automatyczne wdrażanie na serwer produkcyjny przy użyciu tagów gita.

![Potoki CI/CD](3.PNG)

---

### 5. Monitoring i Alerty (Prometheus, Grafana, Alertmanager)
* System posiada rozbudowany stos monitorujący, który pozwala na reakcję w czasie rzeczywistym na problemy z wydajnością.
* **Grafana**: Wizualizuje metryki w czasie rzeczywistym. 
* **Kluczowy wskaźnik**: Całkowity Ruch (RPS) wyliczany za pomocą `sum(rate(http_requests_total[1m]))`.
* **Prometheus**: Zbiera i analizuje dane z backendu pod kątem reguł zdefiniowanych w `alert_rules.yml`.
* **Alertmanager & Discord**: W przypadku wykrycia anomalii (np. High Traffic), Alertmanager wysyła natychmiastowe powiadomienie na Discord za pomocą Webhooka.

![Dashboard Grafana](5.PNG)
![Alert Discord](4.PNG)

---

### Testowanie systemu monitoringu
Aby wywołać alert i sprawdzić system monitoringu, wykonaj prosty test obciążeniowy z terminala serwera:

```bash
for i in {1..8000}; do curl -s -o /dev/null http://localhost:8000/books/; done

```

Po około 60 sekundach alert zmieni stan na Firing, a na Discordzie pojawi się powiadomienie.
