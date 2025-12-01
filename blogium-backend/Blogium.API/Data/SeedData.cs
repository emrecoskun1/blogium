using Blogium.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Blogium.API.Data;

public static class SeedData
{
    private static readonly string[] Categories = new[]
    {
        "Technology", "Programming", "Data Science", "Machine Learning", 
        "Web Development", "Mobile Development", "DevOps", "Cloud Computing",
        "Cybersecurity", "Blockchain", "AI", "Software Engineering",
        "Design", "UX/UI", "Product Management", "Startup",
        "Business", "Marketing", "Finance", "Leadership",
        "Health", "Fitness", "Psychology", "Self Improvement",
        "Writing", "Books", "Travel", "Food",
        "Science", "Education", "Environment", "Politics"
    };

    private static readonly string[] TitleTemplates = new[]
    {
        "The Complete Guide to {0}",
        "10 Things You Should Know About {0}",
        "Why {0} Matters in 2025",
        "Getting Started with {0}",
        "Advanced {0} Techniques",
        "The Future of {0}",
        "How to Master {0}",
        "Common Mistakes in {0}",
        "Best Practices for {0}",
        "Understanding {0} in Depth",
        "The Ultimate {0} Tutorial",
        "{0}: A Beginner's Guide",
        "Expert Tips for {0}",
        "The Art of {0}",
        "Demystifying {0}",
        "{0} for Professionals",
        "The Power of {0}",
        "Revolutionary Changes in {0}",
        "Exploring {0}",
        "The Science Behind {0}"
    };

    private static readonly string[] BodyParagraphs = new[]
    {
        "In today's rapidly evolving technological landscape, understanding the fundamentals is more important than ever. This comprehensive guide will walk you through everything you need to know to get started and excel in this field.",
        "The journey of mastering any skill requires dedication, practice, and the right resources. Throughout this article, we'll explore various aspects and provide you with actionable insights that you can apply immediately.",
        "One of the most common misconceptions is that you need years of experience to make meaningful contributions. However, with the right approach and mindset, anyone can achieve remarkable results in a relatively short time.",
        "Let's dive deep into the core concepts and explore how they interconnect to form a comprehensive understanding. By the end of this section, you'll have a solid foundation to build upon.",
        "Real-world applications are where theory meets practice. We'll examine several case studies that demonstrate how these principles are successfully implemented across different industries.",
        "The landscape is constantly changing, and staying up-to-date with the latest trends and best practices is crucial for continued success. Let's explore what the future holds and how you can prepare for it.",
        "Community and collaboration play a vital role in professional growth. Engaging with peers, sharing knowledge, and learning from others' experiences can accelerate your journey significantly.",
        "Tools and resources are abundant, but knowing which ones to use and when can make all the difference. We'll review the most effective solutions available today.",
        "Challenges and obstacles are inevitable, but they're also opportunities for growth. Understanding common pitfalls and how to avoid them will save you time and frustration.",
        "Measuring progress and setting realistic goals helps maintain motivation and direction. We'll discuss effective strategies for tracking your development and celebrating milestones."
    };

    public static async Task Initialize(BlogiumDbContext context)
    {
        // Check if we already have articles
        if (await context.Articles.AnyAsync())
        {
            return; // Database has been seeded
        }

        // Create seed user
        var seedUser = new User
        {
            Username = "seeduser",
            Email = "seed@blogium.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
            Bio = "Automated content generator for testing purposes",
            EmailVerified = true,
            CreatedAt = DateTime.UtcNow
        };

        context.Users.Add(seedUser);
        await context.SaveChangesAsync();

        // Create tags
        var tags = new List<Tag>();
        foreach (var category in Categories)
        {
            tags.Add(new Tag { Name = category });
        }
        context.Tags.AddRange(tags);
        await context.SaveChangesAsync();

        // Generate 1000 articles
        var random = new Random();
        var articles = new List<Article>();

        for (int i = 1; i <= 1000; i++)
        {
            var category = Categories[random.Next(Categories.Length)];
            var titleTemplate = TitleTemplates[random.Next(TitleTemplates.Length)];
            var title = string.Format(titleTemplate, category);

            var description = $"Discover essential insights about {category.ToLower()}. " +
                            $"This article covers key concepts, practical examples, and expert advice.";

            // Generate body with random paragraphs
            var paragraphCount = random.Next(5, 10);
            var bodyParagraphs = new List<string>();
            for (int p = 0; p < paragraphCount; p++)
            {
                bodyParagraphs.Add(BodyParagraphs[random.Next(BodyParagraphs.Length)]);
            }
            var body = string.Join("\n\n", bodyParagraphs);

            var article = new Article
            {
                Title = title,
                Slug = GenerateSlug(title, i),
                Description = description,
                Body = body,
                AuthorId = seedUser.Id,
                CreatedAt = DateTime.UtcNow.AddDays(-random.Next(0, 365)),
                UpdatedAt = DateTime.UtcNow.AddDays(-random.Next(0, 30))
            };

            articles.Add(article);

            // Add article tags (1-3 random tags)
            var tagCount = random.Next(1, 4);
            var articleTags = new List<ArticleTag>();
            var selectedTags = tags.OrderBy(x => random.Next()).Take(tagCount).ToList();
            
            foreach (var tag in selectedTags)
            {
                articleTags.Add(new ArticleTag
                {
                    Article = article,
                    Tag = tag
                });
            }

            article.ArticleTags = articleTags;

            // Batch insert every 100 articles
            if (i % 100 == 0)
            {
                context.Articles.AddRange(articles);
                await context.SaveChangesAsync();
                articles.Clear();
                Console.WriteLine($"Seeded {i} articles...");
            }
        }

        // Insert remaining articles
        if (articles.Any())
        {
            context.Articles.AddRange(articles);
            await context.SaveChangesAsync();
        }

        Console.WriteLine("✅ Database seeding completed! 1000 articles created.");
    }

    private static string GenerateSlug(string title, int id)
    {
        var slug = title.ToLower()
            .Replace(" ", "-")
            .Replace(":", "")
            .Replace("/", "-")
            .Replace("?", "")
            .Replace("!", "");
        
        // Remove any non-alphanumeric characters except hyphens
        slug = new string(slug.Where(c => char.IsLetterOrDigit(c) || c == '-').ToArray());
        
        return $"{slug}-{id}";
    }
}
