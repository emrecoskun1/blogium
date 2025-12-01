using Blogium.API.Data;
using Blogium.API.Services;
using Blogium.API.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState
                .Where(e => e.Value?.Errors.Count > 0)
                .SelectMany(e => e.Value!.Errors.Select(er => er.ErrorMessage))
                .ToList();

            var result = new
            {
                success = false,
                message = "Validation failed",
                errors
            };

            return new Microsoft.AspNetCore.Mvc.BadRequestObjectResult(result);
        };
    });
    
builder.Services.AddEndpointsApiExplorer();

// Swagger/OpenAPI Configuration
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Version = "v1",
        Title = "Blogium API",
        Description = "A professional blogging platform API built with ASP.NET Core",
        Contact = new OpenApiContact
        {
            Name = "Blogium Team",
            Email = "support@blogium.com"
        }
    });

    // JWT Authentication için Swagger yapılandırması
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. \r\n\r\n " +
                      "Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\n" +
                      "Example: \"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\""
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Database
builder.Services.AddDbContext<BlogiumDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Response Caching for better performance
builder.Services.AddResponseCaching();
builder.Services.AddMemoryCache();

// CORS - Production ready configuration
builder.Services.AddCors(options =>
{
    var isDevelopment = builder.Environment.IsDevelopment();
    
    options.AddPolicy("AllowAngular", policy =>
    {
        if (isDevelopment)
        {
            // Development: Allow localhost
            policy.WithOrigins(
                "http://localhost:4200",
                "http://localhost:4201",
                "http://localhost:3000"
            );
        }
        else
        {
            // Production: Add your production domain here
            var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() 
                ?? new[] { "https://blogium.yunusemrecoskun.xyz" };
            policy.WithOrigins(allowedOrigins);
        }
        
        policy.AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials()
              .WithExposedHeaders("Content-Disposition"); // For file downloads
    });
});

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = Encoding.UTF8.GetBytes(jwtSettings["Secret"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(secretKey),
        ClockSkew = TimeSpan.Zero
    };
});

// Services
builder.Services.AddHttpClient(); // Add HttpClient for Medium RSS import
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IArticleService, ArticleService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ICommentService, CommentService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<INotificationService, NotificationService>();

var app = builder.Build();

// Seed database
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<BlogiumDbContext>();
        context.Database.Migrate();
        await DbSeeder.SeedAsync(context);
        
        // Seed 1000 articles for testing
        await SeedData.Initialize(context);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the database.");
    }
}

// Configure the HTTP request pipeline.
app.UseMiddleware<ErrorHandlingMiddleware>();

app.UseSwagger();
app.UseSwaggerUI(options =>
{
    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Blogium API v1");
    options.RoutePrefix = "swagger";
    options.DocumentTitle = "Blogium API Documentation";
    options.DefaultModelsExpandDepth(-1); // Model detaylarını gizle
});

// app.UseHttpsRedirection(); // HTTP için devre dışı

app.UseCors("AllowAngular");

// Response Caching Middleware - MUST be before authentication
app.UseResponseCaching();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
