# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AssetBridge is a corporate-grade Procurement and Asset Management system designed to streamline:
- Vendor management
- Purchasing workflows
- Asset lifecycle tracking
- Role-based access control (RBAC)
- Modular architecture for scalability

## Architecture Notes

This is a greenfield project. When implementing the system, consider the following architectural principles:

### Modular Design
- Separate concerns into distinct modules: Vendor Management, Procurement, Asset Tracking, User Management, and Reporting
- Each module should be independently deployable and maintainable
- Use clear interfaces between modules to enable future scaling

### Role-Based Access Control
- Implement RBAC as a core cross-cutting concern from the start
- Common roles will likely include: Admin, Procurement Manager, Asset Manager, Vendor, Auditor
- Ensure all API endpoints and UI components respect role permissions

### Data Model Considerations
- Vendor information and procurement records require audit trails
- Asset lifecycle tracking needs to maintain historical state changes
- Consider compliance and regulatory requirements for data retention

## Development Setup

(This section will be populated once the project structure is established)

## Key Commands

(This section will be populated once build tools and scripts are configured)
