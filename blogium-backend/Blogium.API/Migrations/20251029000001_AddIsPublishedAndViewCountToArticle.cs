using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Blogium.API.Migrations
{
    /// <inheritdoc />
    public partial class AddIsPublishedAndViewCountToArticle : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsPublished",
                table: "Articles",
                type: "bit",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<int>(
                name: "ViewCount",
                table: "Articles",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsPublished",
                table: "Articles");

            migrationBuilder.DropColumn(
                name: "ViewCount",
                table: "Articles");
        }
    }
}
