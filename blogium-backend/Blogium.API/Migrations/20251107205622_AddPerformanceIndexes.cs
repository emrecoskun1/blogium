using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Blogium.API.Migrations
{
    /// <inheritdoc />
    public partial class AddPerformanceIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Notifications_CreatedAt",
                table: "Notifications",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId_IsRead",
                table: "Notifications",
                columns: new[] { "UserId", "IsRead" });

            migrationBuilder.CreateIndex(
                name: "IX_Comments_CreatedAt",
                table: "Comments",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_ArticleTags_ArticleId",
                table: "ArticleTags",
                column: "ArticleId");

            migrationBuilder.CreateIndex(
                name: "IX_Articles_AuthorId_CreatedAt",
                table: "Articles",
                columns: new[] { "AuthorId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Articles_CreatedAt",
                table: "Articles",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_ArticleFavorites_UserId",
                table: "ArticleFavorites",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Notifications_CreatedAt",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Notifications_UserId_IsRead",
                table: "Notifications");

            migrationBuilder.DropIndex(
                name: "IX_Comments_CreatedAt",
                table: "Comments");

            migrationBuilder.DropIndex(
                name: "IX_ArticleTags_ArticleId",
                table: "ArticleTags");

            migrationBuilder.DropIndex(
                name: "IX_Articles_AuthorId_CreatedAt",
                table: "Articles");

            migrationBuilder.DropIndex(
                name: "IX_Articles_CreatedAt",
                table: "Articles");

            migrationBuilder.DropIndex(
                name: "IX_ArticleFavorites_UserId",
                table: "ArticleFavorites");
        }
    }
}
