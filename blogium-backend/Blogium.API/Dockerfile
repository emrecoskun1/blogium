FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["Blogium.API.csproj", "./"]
RUN dotnet restore "Blogium.API.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "Blogium.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Blogium.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Blogium.API.dll"]
