-- Blogium 1000 Article Seed Script
-- Bu script veritabanına 1000 makale ekler
-- Çalıştırmadan önce: USE [YourDatabaseName]

-- Önce seed kullanıcı oluştur (eğer yoksa)
IF NOT EXISTS (SELECT 1 FROM Users WHERE Email = 'seed@blogium.com')
BEGIN
    INSERT INTO Users (Username, Email, PasswordHash, Bio, EmailVerified, CreatedAt)
    VALUES (
        'seeduser',
        'seed@blogium.com',
        '$2a$11$8YvZXKzPzKLQj7J1V7uQ3.qH5xPH7WQhV9mZFWkX0DqKzLJKzLJKz', -- Password123!
        'Automated content generator',
        1,
        GETUTCDATE()
    );
END;

DECLARE @SeedUserId INT = (SELECT Id FROM Users WHERE Email = 'seed@blogium.com');

-- Tag'leri oluştur (eğer yoksa)
DECLARE @Tags TABLE (Id INT IDENTITY(1,1), Name NVARCHAR(100));

INSERT INTO @Tags (Name)
VALUES 
('Technology'), ('Programming'), ('Data Science'), ('Machine Learning'),
('Web Development'), ('Mobile Development'), ('DevOps'), ('Cloud Computing'),
('Cybersecurity'), ('Blockchain'), ('AI'), ('Software Engineering'),
('Design'), ('UX/UI'), ('Product Management'), ('Startup'),
('Business'), ('Marketing'), ('Finance'), ('Leadership'),
('Health'), ('Fitness'), ('Psychology'), ('Self Improvement'),
('Writing'), ('Books'), ('Travel'), ('Food'),
('Science'), ('Education'), ('Environment'), ('Politics');

-- Tag'leri Tags tablosuna ekle
INSERT INTO Tags (Name)
SELECT t.Name
FROM @Tags t
WHERE NOT EXISTS (SELECT 1 FROM Tags WHERE Name = t.Name);

-- 1000 makale oluştur
DECLARE @Counter INT = 1;
DECLARE @Title NVARCHAR(500);
DECLARE @Slug NVARCHAR(500);
DECLARE @Description NVARCHAR(MAX);
DECLARE @Body NVARCHAR(MAX);
DECLARE @CreatedAt DATETIME;
DECLARE @ArticleId INT;
DECLARE @TagId INT;
DECLARE @TagCount INT;

DECLARE @TitleTemplates TABLE (Template NVARCHAR(200));
INSERT INTO @TitleTemplates VALUES
('The Complete Guide to {0}'),
('10 Things You Should Know About {0}'),
('Why {0} Matters in 2025'),
('Getting Started with {0}'),
('Advanced {0} Techniques'),
('The Future of {0}'),
('How to Master {0}'),
('Common Mistakes in {0}'),
('Best Practices for {0}'),
('Understanding {0} in Depth'),
('The Ultimate {0} Tutorial'),
('{0}: A Beginner''s Guide'),
('Expert Tips for {0}'),
('The Art of {0}'),
('Demystifying {0}'),
('{0} for Professionals'),
('The Power of {0}'),
('Revolutionary Changes in {0}'),
('Exploring {0}'),
('The Science Behind {0}');

PRINT 'Starting to create 1000 articles...';

WHILE @Counter <= 1000
BEGIN
    -- Rastgele kategori seç
    DECLARE @CategoryName NVARCHAR(100) = (SELECT TOP 1 Name FROM @Tags ORDER BY NEWID());
    
    -- Rastgele başlık template'i seç
    DECLARE @TitleTemplate NVARCHAR(200) = (SELECT TOP 1 Template FROM @TitleTemplates ORDER BY NEWID());
    
    -- Başlığı oluştur
    SET @Title = REPLACE(@TitleTemplate, '{0}', @CategoryName);
    
    -- Slug oluştur
    SET @Slug = LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(@Title, ' ', '-'), ':', ''), '/', '-'), '?', ''), '!', '')) + '-' + CAST(@Counter AS NVARCHAR(10));
    
    -- Description oluştur
    SET @Description = 'Discover essential insights about ' + LOWER(@CategoryName) + '. This article covers key concepts, practical examples, and expert advice.';
    
    -- Body oluştur (5-8 paragraf)
    SET @Body = 
'In today''s rapidly evolving technological landscape, understanding the fundamentals of ' + @CategoryName + ' is more important than ever. This comprehensive guide will walk you through everything you need to know to get started and excel in this field.

The journey of mastering any skill requires dedication, practice, and the right resources. Throughout this article, we''ll explore various aspects of ' + @CategoryName + ' and provide you with actionable insights that you can apply immediately.

One of the most common misconceptions is that you need years of experience to make meaningful contributions. However, with the right approach and mindset, anyone can achieve remarkable results in ' + @CategoryName + ' in a relatively short time.

Let''s dive deep into the core concepts and explore how they interconnect to form a comprehensive understanding. By the end of this section, you''ll have a solid foundation to build upon.

Real-world applications are where theory meets practice. We''ll examine several case studies that demonstrate how these principles are successfully implemented across different industries.

The landscape is constantly changing, and staying up-to-date with the latest trends and best practices in ' + @CategoryName + ' is crucial for continued success. Let''s explore what the future holds and how you can prepare for it.

Community and collaboration play a vital role in professional growth. Engaging with peers, sharing knowledge, and learning from others'' experiences can accelerate your journey significantly.

Tools and resources are abundant, but knowing which ones to use and when can make all the difference. We''ll review the most effective solutions available today for ' + @CategoryName + '.

Challenges and obstacles are inevitable, but they''re also opportunities for growth. Understanding common pitfalls and how to avoid them will save you time and frustration.

Measuring progress and setting realistic goals helps maintain motivation and direction. We''ll discuss effective strategies for tracking your development and celebrating milestones in ' + @CategoryName + '.';
    
    -- Rastgele tarih (son 1 yıl içinde)
    SET @CreatedAt = DATEADD(DAY, -CAST(RAND(CHECKSUM(NEWID())) * 365 AS INT), GETUTCDATE());
    
    -- Makaleyi ekle
    INSERT INTO Articles (Title, Slug, Description, Body, AuthorId, CreatedAt, UpdatedAt)
    VALUES (@Title, @Slug, @Description, @Body, @SeedUserId, @CreatedAt, @CreatedAt);
    
    SET @ArticleId = SCOPE_IDENTITY();
    
    -- 1-3 arası rastgele tag ekle
    SET @TagCount = CAST(RAND(CHECKSUM(NEWID())) * 3 AS INT) + 1;
    
    DECLARE @TagCounter INT = 0;
    WHILE @TagCounter < @TagCount
    BEGIN
        SET @TagId = (SELECT TOP 1 Id FROM Tags WHERE Name IN (SELECT Name FROM @Tags) ORDER BY NEWID());
        
        -- Duplicate check
        IF NOT EXISTS (SELECT 1 FROM ArticleTags WHERE ArticleId = @ArticleId AND TagId = @TagId)
        BEGIN
            INSERT INTO ArticleTags (ArticleId, TagId)
            VALUES (@ArticleId, @TagId);
        END
        
        SET @TagCounter = @TagCounter + 1;
    END
    
    -- İlerlemeyi göster (her 100 makalede)
    IF @Counter % 100 = 0
    BEGIN
        PRINT 'Created ' + CAST(@Counter AS NVARCHAR(10)) + ' articles...';
    END
    
    SET @Counter = @Counter + 1;
END;

PRINT '✅ Successfully created 1000 articles!';

-- İstatistikler
SELECT 
    COUNT(*) as TotalArticles,
    COUNT(DISTINCT AuthorId) as UniqueAuthors,
    (SELECT COUNT(*) FROM Tags) as TotalTags,
    (SELECT COUNT(*) FROM ArticleTags) as TotalArticleTags
FROM Articles;
