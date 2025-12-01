using Blogium.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Blogium.API.Data;

public class BlogiumDbContext : DbContext
{
    public BlogiumDbContext(DbContextOptions<BlogiumDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Article> Articles { get; set; }
    public DbSet<Tag> Tags { get; set; }
    public DbSet<ArticleTag> ArticleTags { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<ArticleFavorite> ArticleFavorites { get; set; }
    public DbSet<UserFollow> UserFollows { get; set; }
    public DbSet<Notification> Notifications { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Username).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Username).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.PasswordHash).IsRequired();
        });

        // Article configuration
        modelBuilder.Entity<Article>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Slug).IsUnique();
            entity.HasIndex(e => e.AuthorId); // Index for author queries
            entity.HasIndex(e => e.CreatedAt); // Index for sorting by date
            entity.HasIndex(e => new { e.AuthorId, e.CreatedAt }); // Composite index for author + date queries
            entity.Property(e => e.Title).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Slug).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Description).IsRequired().HasMaxLength(1000);
            
            entity.HasOne(e => e.Author)
                .WithMany(u => u.Articles)
                .HasForeignKey(e => e.AuthorId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Tag configuration
        modelBuilder.Entity<Tag>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Name).IsUnique();
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
        });

        // ArticleTag configuration (Many-to-Many)
        modelBuilder.Entity<ArticleTag>(entity =>
        {
            entity.HasKey(at => new { at.ArticleId, at.TagId });
            entity.HasIndex(at => at.TagId); // Index for tag queries
            entity.HasIndex(at => at.ArticleId); // Index for article queries

            entity.HasOne(at => at.Article)
                .WithMany(a => a.ArticleTags)
                .HasForeignKey(at => at.ArticleId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(at => at.Tag)
                .WithMany(t => t.ArticleTags)
                .HasForeignKey(at => at.TagId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Comment configuration
        modelBuilder.Entity<Comment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.ArticleId); // Index for article comments
            entity.HasIndex(e => e.CreatedAt); // Index for sorting comments
            entity.Property(e => e.Body).IsRequired().HasMaxLength(2000);

            entity.HasOne(e => e.Article)
                .WithMany(a => a.Comments)
                .HasForeignKey(e => e.ArticleId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Author)
                .WithMany(u => u.Comments)
                .HasForeignKey(e => e.AuthorId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // ArticleFavorite configuration (Many-to-Many)
        modelBuilder.Entity<ArticleFavorite>(entity =>
        {
            entity.HasKey(af => new { af.UserId, af.ArticleId });
            entity.HasIndex(af => af.ArticleId); // Index for article favorites
            entity.HasIndex(af => af.UserId); // Index for user favorites

            entity.HasOne(af => af.User)
                .WithMany(u => u.FavoriteArticles)
                .HasForeignKey(af => af.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(af => af.Article)
                .WithMany(a => a.FavoritedBy)
                .HasForeignKey(af => af.ArticleId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // UserFollow configuration (Many-to-Many)
        modelBuilder.Entity<UserFollow>(entity =>
        {
            entity.HasKey(uf => new { uf.FollowerId, uf.FollowingId });

            entity.HasOne(uf => uf.Follower)
                .WithMany(u => u.Following)
                .HasForeignKey(uf => uf.FollowerId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(uf => uf.Following)
                .WithMany(u => u.Followers)
                .HasForeignKey(uf => uf.FollowingId)
                .OnDelete(DeleteBehavior.NoAction);
        });

        // Notification configuration
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.UserId); // Index for user notifications
            entity.HasIndex(e => new { e.UserId, e.IsRead }); // Composite index for unread notifications
            entity.HasIndex(e => e.CreatedAt); // Index for sorting by date
            entity.Property(e => e.Type).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Message).IsRequired().HasMaxLength(500);
            entity.Property(e => e.IsRead).HasDefaultValue(false);

            entity.HasOne(n => n.User)
                .WithMany()
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(n => n.Actor)
                .WithMany()
                .HasForeignKey(n => n.ActorId)
                .OnDelete(DeleteBehavior.NoAction);

            entity.HasOne(n => n.Article)
                .WithMany()
                .HasForeignKey(n => n.ArticleId)
                .OnDelete(DeleteBehavior.NoAction);
        });
    }
}
