using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace Blogium.API.TempModels;

public partial class TempContext : DbContext
{
    public TempContext(DbContextOptions<TempContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Article> Articles { get; set; }

    public virtual DbSet<ArticleFavorite> ArticleFavorites { get; set; }

    public virtual DbSet<Comment> Comments { get; set; }

    public virtual DbSet<Tag> Tags { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserFollow> UserFollows { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Article>(entity =>
        {
            entity.HasIndex(e => e.AuthorId, "IX_Articles_AuthorId");

            entity.HasIndex(e => e.Slug, "IX_Articles_Slug").IsUnique();

            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.Slug).HasMaxLength(500);
            entity.Property(e => e.Title).HasMaxLength(500);

            entity.HasOne(d => d.Author).WithMany(p => p.Articles).HasForeignKey(d => d.AuthorId);

            entity.HasMany(d => d.Tags).WithMany(p => p.Articles)
                .UsingEntity<Dictionary<string, object>>(
                    "ArticleTag",
                    r => r.HasOne<Tag>().WithMany().HasForeignKey("TagId"),
                    l => l.HasOne<Article>().WithMany().HasForeignKey("ArticleId"),
                    j =>
                    {
                        j.HasKey("ArticleId", "TagId");
                        j.ToTable("ArticleTags");
                        j.HasIndex(new[] { "TagId" }, "IX_ArticleTags_TagId");
                    });
        });

        modelBuilder.Entity<ArticleFavorite>(entity =>
        {
            entity.HasKey(e => new { e.UserId, e.ArticleId });

            entity.HasIndex(e => e.ArticleId, "IX_ArticleFavorites_ArticleId");

            entity.HasOne(d => d.Article).WithMany(p => p.ArticleFavorites)
                .HasForeignKey(d => d.ArticleId)
                .OnDelete(DeleteBehavior.ClientSetNull);

            entity.HasOne(d => d.User).WithMany(p => p.ArticleFavorites).HasForeignKey(d => d.UserId);
        });

        modelBuilder.Entity<Comment>(entity =>
        {
            entity.HasIndex(e => e.ArticleId, "IX_Comments_ArticleId");

            entity.HasIndex(e => e.AuthorId, "IX_Comments_AuthorId");

            entity.Property(e => e.Body).HasMaxLength(2000);

            entity.HasOne(d => d.Article).WithMany(p => p.Comments).HasForeignKey(d => d.ArticleId);

            entity.HasOne(d => d.Author).WithMany(p => p.Comments)
                .HasForeignKey(d => d.AuthorId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        modelBuilder.Entity<Tag>(entity =>
        {
            entity.HasIndex(e => e.Name, "IX_Tags_Name").IsUnique();

            entity.Property(e => e.Name).HasMaxLength(100);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.Email, "IX_Users_Email").IsUnique();

            entity.HasIndex(e => e.Username, "IX_Users_Username").IsUnique();

            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.Username).HasMaxLength(100);
        });

        modelBuilder.Entity<UserFollow>(entity =>
        {
            entity.HasKey(e => new { e.FollowerId, e.FollowingId });

            entity.HasIndex(e => e.FollowingId, "IX_UserFollows_FollowingId");

            entity.HasOne(d => d.Follower).WithMany(p => p.UserFollowFollowers)
                .HasForeignKey(d => d.FollowerId)
                .OnDelete(DeleteBehavior.ClientSetNull);

            entity.HasOne(d => d.Following).WithMany(p => p.UserFollowFollowings)
                .HasForeignKey(d => d.FollowingId)
                .OnDelete(DeleteBehavior.ClientSetNull);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
