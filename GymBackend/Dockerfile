FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["GymBackend.csproj", "./"]
RUN dotnet restore "GymBackend.csproj"

COPY . .
RUN dotnet publish "GymBackend.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080
ENV TZ=America/Santiago

ENTRYPOINT ["dotnet", "GymBackend.dll"]