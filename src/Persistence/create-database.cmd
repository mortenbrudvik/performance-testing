echo "Deleting old migrations and creating new ones"
del /Q Migrations\*
mkdir Migrations

dotnet ef database drop -f --startup-project ../Api

dotnet ef migrations add Initial --startup-project ../Api

dotnet ef database update --startup-project ../Api
