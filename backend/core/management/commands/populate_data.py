import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import Tool
from datetime import date, timedelta

User = get_user_model()

class Command(BaseCommand):
    def handle(self, *args, **options):
        self.stdout.write("Starting data population...")

        # Create users
        warehouse_user, warehouse_created = User.objects.get_or_create(
            username='warehouse',
            defaults={'first_name': 'Warehouse', 'last_name': 'Account', 'country': 'USA'}
        )
        if warehouse_created:
            warehouse_user.set_password('milwaukee')
            warehouse_user.save()
            self.stdout.write(self.style.SUCCESS('Successfully created user "warehouse"'))
        else:
            self.stdout.write('User "warehouse" already exists.')

        demo_user, demo_created = User.objects.get_or_create(
            username='demo',
            defaults={'first_name': 'Demo', 'last_name': 'User', 'country': 'Canada'}
        )
        if demo_created:
            demo_user.set_password('demopass')
            demo_user.save()
            self.stdout.write(self.style.SUCCESS('Successfully created user "demo"'))
        else:
            self.stdout.write('User "demo" already exists.')

        # Check if tools already exist for the warehouse user
        if Tool.objects.filter(assigned_to=warehouse_user).exists():
            self.stdout.write('Tools already exist for the warehouse user. Skipping tool creation.')
            return

        # Create tools
        tool_names = [
            "M18 FUEL 1/2 in. Hammer Drill/Driver", "M12 FUEL SURGE 1/4 in. Hex Hydraulic Driver",
            "M18 FUEL 7-1/4 in. Circular Saw", "M18 FUEL SAWZALL Reciprocating Saw",
            "M18 FUEL 1 in. D-Handle High Torque Impact Wrench", "M12 FUEL 3/8 in. Ratchet",
            "M18 FUEL 4-1/2 in. / 5 in. Grinder", "M18 FUEL Compact Router", "M18 FUEL Blower",
            "M18 ROCKET Dual Power Tower Light", "PACKOUT Rolling Tool Box", "PACKOUT Crate",
            "M12 Soldering Iron", "M18 Wet/Dry Vacuum", "M18 FUEL Deep Cut Band Saw",
            "M12 Copper Tubing Cutter", "M18 FUEL Belt Sander", "M18 Random Orbit Sander",
            "M12 Rotary Tool", "M18 FUEL 1/2 in. Compact Impact Wrench", "M18 FUEL Multi-Tool",
            "M18 FUEL 10 in. Miter Saw", "M18 FUEL Table Saw", "M18 FUEL Framing Nailer",
            "M18 FUEL Finish Nailer", "M12 Pin Nailer", "M18 Cable Stripper", "M12 PVC Shear",
            "M18 FUEL Drywall Screw Gun", "M18 Cut-Out Tool"
        ]

        tools_to_create = []
        for name in tool_names:
            manufactured_date = date.today() - timedelta(days=random.randint(30, 365 * 3))
            tool = Tool(
                name=name,
                description=f"A high-quality, durable {name.lower()}.",
                manufactured_date=manufactured_date,
                assigned_to=warehouse_user
            )
            tools_to_create.append(tool)

        Tool.objects.bulk_create(tools_to_create)
        self.stdout.write(self.style.SUCCESS(f'Successfully created {len(tool_names)} tools and assigned them to "warehouse".'))
        self.stdout.write(self.style.SUCCESS('Data population complete.'))
