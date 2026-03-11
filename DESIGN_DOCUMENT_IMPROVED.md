# Driver Database System — Complete Design Document

## 1. System Overview

The City Driver Database Management System manages ~100 driver records with:
- **Fast O(1) search** by license number via hash table
- **Positional insertion** (beginning, end, by county)
- **N most/least recent** licenses via Stack/Queue
- **Migration** to inactive database
- **Custom data structures** only (no STL)
- **Composition + Inheritance** design

---

## 2. Complete Class Hierarchy and Relationships

### 2.1 Value Classes (Composition Building Blocks)

```mermaid
classDiagram
    class Date {
        -int day, month, year
        +Date()
        +Date(d, m, y)
        +getDay/Month/Year() int
        +yearsUntil(Date) int
        +daysSince(Date) int
        +operator<,>,== (Date) bool
        +toString() string
        +fromString(string)$ Date
    }

    class Address {
        -string street, city, county, state, zip
        +Address()
        +Address(street, city, county, state, zip)
        +getCounty() string
        +toString() string
        +fromString(string)$ Address
    }

    class License {
        -string licenseNumber
        -Date issueDate, expiryDate
        +License()
        +License(number, issueDate, expiryDate)
        +getLicenseNumber() string
        +getIssueDate() Date
        +getExpiryDate() Date
        +isExpired(Date today) bool
        +yearsIssued(Date today) int
        +toString() string
    }

    class Ticket {
        -Date issueDate
        -string location, violation
        -double fineAmount
        +Ticket()
        +Ticket(date, location, violation, fine)
        +getIssueDate() Date
        +getLocation() string
        +getViolation() string
        +getFineAmount() double
        +toString() string
    }

    License *-- Date : issueDate, expiryDate
    Ticket *-- Date : issueDate
```

### 2.2 Driver Inheritance Hierarchy

```mermaid
classDiagram
    class Driver {
        <<abstract>>
        #string name
        #Date dob
        #Address homeAddress, workAddress
        #License license
        #WorkCategory workCategory
        #MedicalCondition medicalCondition
        #MiniVector~Ticket~ tickets
        #MiniVector~string~ frequentLocations
        ---
        +getName() string
        +getDOB() Date
        +getAge(Date today) int
        +getExperienceYears(Date today) int
        +getExperienceCategory()* ExperienceCategory
        +getAgeCategory()* string
        +addTicket(Ticket) void
        +display() void
        +toCSV() string
        +~Driver()
    }

    class YouthDriver {
        +getAgeCategory() string
        +getInsuranceCategory() string
    }

    class MiddleAgedDriver {
        +getAgeCategory() string
    }

    class SeniorDriver {
        +getAgeCategory() string
        +requiresMedicalCheck() bool
    }

    Driver <|-- YouthDriver : extends (16-28)
    Driver <|-- MiddleAgedDriver : extends (29-50)
    Driver <|-- SeniorDriver : extends (51+)
```

### 2.3 Driver Composition

```mermaid
classDiagram
    class Driver
    class Date
    class Address
    class License
    class Ticket

    Driver *-- Date : dob
    Driver *-- Address : homeAddress, workAddress
    Driver *-- License : license
    Driver o-- Ticket : tickets [0..*]
    License *-- Date : issueDate, expiryDate
    Ticket *-- Date : issueDate
```

### 2.4 DriverDatabase Architecture

```mermaid
classDiagram
    class DriverDatabase {
        -LinkedList~Driver*~ driverList
        -HashTable~string,Driver*~ hashTable
        -Stack~Driver*~ recentStack
        -Queue~Driver*~ oldestQueue
        -LinkedList~Driver*~ inactiveList
        -HashTable~string,Driver*~ inactiveHashTable
        ---
        +loadFromCSV(filename) void
        +saveToCSV(filename) void
        +insertAtBeginning(Driver*) void
        +insertAtEnd(Driver*) void
        +insertByCounty(Driver*) void
        +searchByLicense(licenseNum) Driver*
        +getNRecentLicenses(n) MiniVector
        +getNOldestLicenses(n) MiniVector
        +migrateToInactive(licenseNum) bool
        +addTicketToDriver(licenseNum, Ticket) bool
        +displayAll() void
        +displayInactive() void
        +~DriverDatabase() DTOR-deletes all Driver*
    }

    class Driver
    class LinkedList
    class HashTable
    class Stack
    class Queue

    DriverDatabase --> LinkedList : driverList
    DriverDatabase --> HashTable : hashTable
    DriverDatabase --> Stack : recentStack
    DriverDatabase --> Queue : oldestQueue
    DriverDatabase --> LinkedList : inactiveList
    DriverDatabase --> HashTable : inactiveHashTable
```

### 2.5 DriverFactory Pattern

```mermaid
classDiagram
    class DriverFactory {
        +createDriver(name, dob, homeAddr, workAddr, lic, workCat, medCond, today)$ Driver*
        +createFromCSV(csvLine, today)$ Driver*
    }

    class Driver
    class YouthDriver
    class MiddleAgedDriver
    class SeniorDriver

    DriverFactory ..> Driver : creates
    DriverFactory ..> YouthDriver : creates
    DriverFactory ..> MiddleAgedDriver : creates
    DriverFactory ..> SeniorDriver : creates
```

---

## 3. Enumerations and Constants

```mermaid
classDiagram
    class WorkCategory {
        <<enumeration>>
        STUDENT
        GOVERNMENT_EMPLOYEE
        SELF_EMPLOYED
        BUSINESS_OWNER
        PRIVATE_SECTOR_EMPLOYEE
    }

    class ExperienceCategory {
        <<enumeration>>
        NEW_DRIVER
        MODERATE_EXPERIENCE
        HIGHLY_EXPERIENCED
    }

    class MedicalCondition {
        <<enumeration>>
        FIT
        VISION_IMPAIRED
        UPPER_EXTREMITY_IMPAIRMENT
        LOCOMOTOR_DISABILITY
    }

    class Driver
    Driver --> WorkCategory
    Driver --> ExperienceCategory
    Driver --> MedicalCondition
```

---

## 4. Custom Data Structures

```mermaid
classDiagram
    class MiniVector~T~ {
        -T* data
        -int size, capacity
        +push_back(T) void
        +operator[](int) T&
        +size() int
    }

    class LinkedList~T~ {
        -Node* head, tail
        -int count
        +insertFront(T) void
        +insertEnd(T) void
        +insertAfter(Node*, T) void
        +removeNode(Node*) bool
        +getHead() Node*
        +size() int
    }

    class Node~T~ {
        T data
        Node* next, prev
    }

    class Stack~T~ {
        -MiniVector~T~ vec
        +push(T) void
        +pop() T
        +top() T&
        +size() int
    }

    class Queue~T~ {
        -QueueNode* front, rear
        -int count
        +enqueue(T) void
        +dequeue() T
        +front() T&
    }

    class HashTable~K,V~ {
        -ChainNode** buckets
        -int tableSize, count
        +insert(K, V) void
        +find(K) V*
        +remove(K) bool
        +contains(K) bool
    }

    LinkedList *-- Node
    Stack *-- MiniVector
```

---

## 5. Main Program Flow

### 5.1 System Initialization

```mermaid
flowchart TD
    START([🟢 START]) --> INIT["Initialize DriverDatabase<br/>db = new DriverDatabase()"]
    INIT --> LOAD["📂 Load CSV<br/>db.loadFromCSV('drivers.csv')"]
    LOAD --> CHECK{"Load<br/>Success?"}
    CHECK -->|No| ERR["❌ Error<br/>Exit"]
    CHECK -->|Yes| BUILD["🔨 Build Structures<br/>LinkedList, HashTable, Stack, Queue"]
    BUILD --> MENU["Show Menu & Loop"]
    MENU --> CLEANUP["Cleanup on exit"]
    CLEANUP --> END([🔴 END])
    ERR --> END

    style START fill:#90EE90
    style END fill:#FFB6C6
    style BUILD fill:#87CEEB
```

### 5.2 Insert Driver Sub-Flow

```mermaid
flowchart TD
    INS([Insert]) --> GETINFO["Get all driver info<br/>name, DOB, addresses<br/>license, categories"]
    GETINFO --> FACTORY["DriverFactory::createDriver()<br/>Calculate age"]
    FACTORY --> AGECHECK{"Age?"}
    AGECHECK -->|16-28| YOUTH["new YouthDriver()"]
    AGECHECK -->|29-50| MIDDLE["new MiddleAgedDriver()"]
    AGECHECK -->|51+| SENIOR["new SeniorDriver()"]
    
    YOUTH --> POS{"Insert<br/>Position?"}
    MIDDLE --> POS
    SENIOR --> POS
    
    POS -->|Beginning| FRONT["insertAtBeginning()<br/>O(1)"]
    POS -->|End| BACK["insertAtEnd()<br/>O(1)"]
    POS -->|By County| COUNTY["insertByCounty()<br/>O(n)"]
    
    FRONT --> HASH["Add to HashTable<br/>O(1)"]
    BACK --> HASH
    COUNTY --> HASH
    HASH --> REBUILD["Rebuild Stack & Queue<br/>O(n)"]
    REBUILD --> OK["✅ Done"]
    OK --> RETURN([Return])

    style INS fill:#FFE4B5
    style OK fill:#90EE90
    style FACTORY fill:#87CEEB
```

### 5.3 Search by License

```mermaid
flowchart TD
    SRCH([Search]) --> INPUT["Input License Num"]
    INPUT --> HASH["HashTable::find()<br/>O(1) avg"]
    HASH --> FOUND{"Found?"}
    FOUND -->|Yes| DISP["Display Driver Details"]
    FOUND -->|No| ERR["❌ Not Found"]
    DISP --> RETURN([Return])
    ERR --> RETURN

    style SRCH fill:#FFE4B5
    style DISP fill:#90EE90
    style HASH fill:#87CEEB
```

### 5.4 Get N Most Recent Licenses

```mermaid
flowchart TD
    RECENT([Get N Recent]) --> INPUT["Input N"]
    INPUT --> VALIDATE{"Valid N?"}
    VALIDATE -->|No| ERR["❌ Invalid"]
    VALIDATE -->|Yes| RETRIEVE["Get from Stack<br/>Top = newest<br/>O(n) retrieve"]
    RETRIEVE --> DISPLAY["Display newest → oldest"]
    DISPLAY --> RETURN([Return])
    ERR --> RETURN

    style RECENT fill:#FFE4B5
    style DISPLAY fill:#90EE90
    style RETRIEVE fill:#87CEEB
```

### 5.5 Get N Oldest Licenses

```mermaid
flowchart TD
    OLDEST([Get N Oldest]) --> INPUT["Input N"]
    INPUT --> VALIDATE{"Valid N?"}
    VALIDATE -->|No| ERR["❌ Invalid"]
    VALIDATE -->|Yes| RETRIEVE["Get from Queue<br/>Front = oldest<br/>O(n) retrieve"]
    RETRIEVE --> DISPLAY["Display oldest → newest"]
    DISPLAY --> RETURN([Return])
    ERR --> RETURN

    style OLDEST fill:#FFE4B5
    style DISPLAY fill:#90EE90
    style RETRIEVE fill:#87CEEB
```

### 5.6 Migrate to Inactive

```mermaid
flowchart TD
    MIG([Migrate]) --> INPUT["Input License"]
    INPUT --> SEARCH["Find in active DB<br/>HashTable::find() O(1)"]
    SEARCH --> FOUND{"Found?"}
    FOUND -->|No| ERR["❌ Not Found"]
    FOUND -->|Yes| REMOVE["Remove from active<br/>LinkedList O(n)<br/>HashTable O(1)"]
    REMOVE --> ADD["Add to inactive<br/>LinkedList O(1)<br/>HashTable O(1)"]
    ADD --> REBUILD["Rebuild Stack & Queue<br/>O(n)"]
    REBUILD --> OK["✅ Migrated"]
    OK --> RETURN([Return])
    ERR --> RETURN

    style MIG fill:#FFE4B5
    style OK fill:#90EE90
    style REMOVE fill:#FFD700
    style ADD fill:#FFD700
```

---

## 6. Key Algorithms with Complexity

### 6.1 Search By License — O(1) Average

```
ALGORITHM SearchByLicense(licenseNumber) → Driver*:
    1. h = hash(licenseNumber) MOD tableSize
    2. chain = buckets[h]
    3. WHILE chain ≠ NULL:
           IF chain.key == licenseNumber:
               RETURN chain.value    // O(1) found
           chain = chain.next
    4. RETURN NULL    // O(1) not found
    
    TIME: O(1) average, O(n) worst (collisions)
```

### 6.2 Insert at Beginning / End — O(1)

```
ALGORITHM InsertAtBeginning(Driver*):
    1. driverList.insertFront(driver)   // O(1)
    2. hashTable.insert(license, driver) // O(1)
    3. rebuildStackAndQueue()            // O(n)
    
    TOTAL: O(n) due to rebuild

ALGORITHM InsertAtEnd(Driver*):
    1. driverList.insertEnd(driver)    // O(1)
    2. hashTable.insert(license, driver) // O(1)
    3. rebuildStackAndQueue()           // O(n)
    
    TOTAL: O(n) due to rebuild
```

### 6.3 Insert By County (Grouped) — O(n)

```
ALGORITHM InsertByCounty(Driver*):
    1. targetCounty = driver.homeAddress.county
    2. TRAVERSE linkedList to find last node with targetCounty
       lastMatch = NULL
       FOR each node in driverList:    // O(n)
           IF node.county == targetCounty:
               lastMatch = node
           ELSE IF node.county > targetCounty:
               BREAK
    
    3. INSERT at position:
       IF lastMatch ≠ NULL:
           driverList.insertAfter(lastMatch, driver)
       ELSE:
           driverList.insertFront(driver)
    
    4. hashTable.insert(license, driver)  // O(1)
    5. rebuildStackAndQueue()             // O(n)
    
    TIME: O(n)
```

### 6.4 Get N Most Recent Licenses — O(n)

```
ALGORITHM GetNRecentLicenses(n) → MiniVector<Driver*>:
    1. result = empty MiniVector
    2. IF n < 1 OR n > activeCount:
           RETURN empty
    
    3. stack has newest on top (last pushed)
    4. FOR idx from stack.size()-1 down to 0:  // O(n)
           IF result.size() < n:
               result.push_back(stack[idx])
    
    5. RETURN result    // Newest first
    
    TIME: O(n) retrieval + O(n) stack rebuild per insertion
```

### 6.5 Get N Oldest Licenses — O(n)

```
ALGORITHM GetNOldestLicenses(n) → MiniVector<Driver*>:
    1. result = empty MiniVector
    2. IF n < 1 OR n > activeCount:
           RETURN empty
    
    3. queue has oldest at front (first enqueued)
    4. node = queue.front()
       FOR i = 0 to min(n, queue.size())-1:  // O(n)
           result.push_back(node.data)
           node = node.next
    
    5. RETURN result    // Oldest first
    
    TIME: O(n) retrieval + O(n) queue rebuild per insertion
```

### 6.6 Migrate Driver to Inactive — O(n)

```
ALGORITHM MigrateDriver(licenseNumber) → bool:
    1. driver = hashTable.find(licenseNumber)  // O(1)
       IF driver == NULL:
           RETURN false
    
    2. Find node in linkedList:          // O(n)
       node = NULL
       FOR each n in driverList:
           IF n.license == licenseNumber:
               node = n; BREAK
    
    3. driverList.removeNode(node)       // O(1)
    4. hashTable.remove(licenseNumber)   // O(1)
    5. inactiveList.insertEnd(driver)    // O(1)
    6. inactiveHashTable.insert(license, driver)  // O(1)
    7. rebuildStackAndQueue()            // O(n)
    
    RETURN true
    TIME: O(n)
```

### 6.7 Driver Factory — Age Calculation — O(1)

```
ALGORITHM CreateDriver(..., today) → Driver*:
    1. age = today.yearsUntil(dob)      // O(1)
    2. IF age <= 28:
           RETURN new YouthDriver(...)
       ELSE IF age <= 50:
           RETURN new MiddleAgedDriver(...)
       ELSE:
           RETURN new SeniorDriver(...)
    
    TIME: O(1)
```

---

## 7. Data Flow Diagrams

### 7.1 System Level

```mermaid
graph LR
    CSV["drivers.csv<br/>(100 records)"] -->|parse| PARSE["CSV Parser"]
    PARSE -->|fields| FACTORY["DriverFactory"]
    FACTORY -->|Driver*| DB["DriverDatabase"]
    
    DB --> LL["LinkedList<br/>(ordered)"]
    DB --> HT["HashTable<br/>(O1 search)"]
    DB --> STK["Stack<br/>(recent)"]
    DB --> QUE["Queue<br/>(oldest)"]
    
    USER["👤 User"] -->|menu| MAIN["main.cpp"]
    MAIN -->|search| HT
    MAIN -->|insert| LL
    MAIN -->|N recent| STK
    MAIN -->|N oldest| QUE
    MAIN -->|migrate| INACTIVE["Inactive DB"]
    MAIN -->|save| OUT["output.csv"]

    style CSV fill:#FFE4B5
    style FACTORY fill:#87CEEB
    style LL fill:#98FB98
    style HT fill:#98FB98
    style OUT fill:#FFB6C6
```

### 7.2 Driver Lifecycle

```mermaid
graph TD
    A["CSV file"] --> B["Parse line"]
    B --> C["DriverFactory<br/>createDriver"]
    C --> D["Calculate age"]
    D --> E{Age?}
    E -->|16-28| F["YouthDriver*"]
    E -->|29-50| G["MiddleAgedDriver*"]
    E -->|51+| H["SeniorDriver*"]
    F --> I["Add to Active DB"]
    G --> I
    H --> I
    I --> J["User operations"]
    J --> K{Migrate?}
    K -->|Yes| L["Move to Inactive"]
    K -->|No| M["Delete on cleanup"]
    L --> N["Delete on cleanup"]

    style A fill:#FFE4B5
    style M fill:#FFB6C6
    style N fill:#FFB6C6
```

---

## 8. Requirements Fulfillment

| # | Requirement | Solution | Complexity |
|---|---|---|---|
| 1 | Store driver info | Composition: Date, Address, License, Ticket | — |
| 2 | Age classification | Inheritance: YouthDriver, MiddleAgedDriver, SeniorDriver | — |
| 3 | Work categories | Enum WorkCategory | — |
| 4 | Experience categories | Enum ExperienceCategory (computed) | — |
| 5 | Medical conditions | Enum MedicalCondition | — |
| 6 | Insert at beginning | LinkedList::insertFront() | **O(1)** |
| 7 | Insert at end | LinkedList::insertEnd() | **O(1)** |
| 8 | Insert by county | LinkedList::insertByCounty() | O(n) |
| 9 | Fast search | HashTable with djb2 hash | **O(1)** avg |
| 10 | N most recent | Stack (newest on top) | O(n) |
| 11 | N oldest | Queue (oldest at front) | O(n) |
| 12 | Migration | Remove active, add inactive | O(n) search |
| 13 | No STL | Custom MiniVector, LinkedList, Stack, Queue, HashTable | — |
| 14 | Compile | Makefile for g++ | — |
| 15 | Load from file | loadFromCSV() | O(n) |
| 16 | Save to file | saveToCSV() | O(n) |

---

## 9. Memory Management

**DriverDatabase OWNS all Driver pointers:**

- Single allocation per driver via DriverFactory
- LinkedList, HashTable, Stack, Queue all reference same Driver* object
- NO deep copying during migration (pointer reassignment only)
- ALL Driver* deleted in ~DriverDatabase() destructor

```cpp
~DriverDatabase() {
    // Delete all active drivers
    Node<Driver*>* current = driverList.getHead();
    while (current) {
        delete current->data;
        current = current->next;
    }
    // Delete all inactive drivers
    current = inactiveList.getHead();
    while (current) {
        delete current->data;
        current = current->next;
    }
}
```

---

## 10. Design Patterns

1. **Factory** — DriverFactory encapsulates polymorphic creation
2. **Strategy** — User selects insertion strategy (beginning, end, county)
3. **Template Method** — Generic data structures (templated classes)
4. **Composition** — Value objects (Date, Address, License, Ticket) composed in Driver

---

## 11. CSV Format

**Pipe-delimited** with semicolon/colon for nested data:

```
Name|DOB(DD/MM/YYYY)|HomeStreet|HomeCity|HomeCounty|HomeState|HomeZip|WorkStreet|WorkCity|WorkCounty|WorkState|WorkZip|LicenseNumber|IssueDate(DD/MM/YYYY)|ExpiryDate(DD/MM/YYYY)|WorkCategory(1-5)|MedicalCondition(1-4)|FrequentLocations|Tickets
```

---

## 12. Implementation Tips

- **Age**: Date::yearsUntil() for driver age from DOB
- **Experience**: Date::daysSince() from license issue date
- **Sorting**: License issue date is KEY for Stack/Queue correctness
- **Rebuild**: After each insertion/migration, call rebuildStackAndQueue()
- **Cleanup**: Destructor must delete all Driver* pointers
- **Consistency**: Same Driver* referenced in all 4 active structures

