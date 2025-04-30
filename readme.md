## USUÁRIOS

```sql
CREATE TABLE Users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role ENUM('student', 'mentor') NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE PwdResetTokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    hash_url VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);
```

## CURSOS

```sql
CREATE TABLE Courses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE Classes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    course_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES Courses(id) ON DELETE CASCADE
);

CREATE TABLE ClassUsers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    class_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES Classes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);
```

## AULAS

```sql
CREATE TABLE Lessons (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    lesson_description TEXT,
    course_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES Courses(id) ON DELETE CASCADE
);

CREATE TABLE LessonContents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lesson_id INT NOT NULL,
    content_type ENUM('video', 'text', 'activity', 'reunion') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_id) REFERENCES Lessons(id) ON DELETE CASCADE
);
```

### TEXTOS

```sql
CREATE TABLE LessonText (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lesson_content_id INT NOT NULL,
    text_title TEXT,
    text_content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_content_id) REFERENCES LessonContents(id) ON DELETE CASCADE
);
```

### VIDEOS

```sql
CREATE TABLE LessonVideo (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lesson_content_id INT NOT NULL,
    video_title TEXT,
    video_url VARCHAR(255),
    video_content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_content_id) REFERENCES LessonContents(id) ON DELETE CASCADE
);
```

### REUNIÕES

```sql
CREATE TABLE LessonReunions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lesson_content_id INT NOT NULL,
    reunion_title TEXT,
    reunion_url VARCHAR(255),
    reunion_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_content_id) REFERENCES LessonContents(id) ON DELETE CASCADE
);

CREATE TABLE ReunionSchedules (
    id INT PRIMARY KEY AUTO_INCREMENT,
    reunion_id INT NOT NULL,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    duration_minutes INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reunion_id) REFERENCES LessonReunions(id) ON DELETE CASCADE
);
```

### ATIVIDADES

A tabela **Lessons** representa uma **aula**. Cada aula pode conter diversos **conteúdos**, que estão registrados na tabela **LessonContents**. Esses conteúdos podem ser de quatro tipos: **vídeo**, **texto**, **atividade** ou **reunião**, e cada tipo possui sua própria tabela específica para armazenar informações adicionais. No caso de conteúdos do tipo **atividade** (quando `LessonContents.content_type = 'activity'`), eles são compostos por vários **enunciados**, que estão na tabela **ActivityStatements** e são vinculados ao conteúdo através do campo `lesson_content_id`. Cada enunciado, por sua vez, é formado por diversas **opções** de resposta, registradas na tabela **ActivityOptions**, podendo essas opções ser corretas ou incorretas.

```sql
CREATE TABLE ActivityStatements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    lesson_content_id INT NOT NULL,
    question_order INT NOT NULL,
    statement_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lesson_content_id) REFERENCES LessonContents(id) ON DELETE CASCADE
);

CREATE TABLE ActivityOptions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    statement_id INT NOT NULL,
    option_order INT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (statement_id) REFERENCES ActivityStatements(id) ON DELETE CASCADE
);

CREATE TABLE StudentAnswers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    option_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (option_id) REFERENCES ActivityOptions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);
```
