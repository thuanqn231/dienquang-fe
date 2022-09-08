
// material
import { Card, CardHeader, Grid, Stack } from '@material-ui/core';
import DeliveryQuality from './DeliveryQuality';
import DeliveryStatus from './DeliveryStatus';
import InventoryStatus from './InventoryStatus';
import MaintenanceIndex from './MaintenanceIndex';
import OverallEquipmentEffectiveness from './OverallEquipmentEffectiveness';
import ProductionQuality from './ProductionQuality';
import ProductionStatus from './ProductionStatus';
import ProductionStatusByGroup from './ProductionStatusByGroup';

// ----------------------------------------------------------------------
export default function ComprehensiveStatus() {
    return (
        <Grid container spacing={1}>
            <Grid item xs={12} md={6}>
                <Card sx={{ height: '36vh' }}>
                    <CardHeader title="Production Status" sx={{ backgroundColor: 'primary.main', textAlign: 'center', p: 1 }} />
                    <Stack direction="row" spacing={1} sx={{ height: '100%' }}>
                        <Grid item xs={12} md={4}>
                            <ProductionStatus />
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <ProductionStatusByGroup />
                        </Grid>
                    </Stack>
                </Card>
            </Grid>
            <Grid item xs={12} md={6}>
                <Card sx={{ height: '36vh' }}>
                    <CardHeader title="Equipment Effetiveness" sx={{ backgroundColor: 'primary.main', textAlign: 'center', p: 1 }} />
                    <Stack direction="row" spacing={1} sx={{ height: '100%' }}>
                        <Grid item xs={12} md={4}>
                            <MaintenanceIndex />
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <OverallEquipmentEffectiveness />
                        </Grid>
                    </Stack>
                </Card>
            </Grid>
            <Grid item xs={12} md={6}>
                <Card sx={{ height: '36vh' }}>
                    <CardHeader title="Quality Status" sx={{ backgroundColor: 'primary.main', textAlign: 'center', p: 1 }} />
                    <Stack direction="row" spacing={1} sx={{ height: '100%' }}>
                        <Grid item xs={12} md={6}>
                            <ProductionQuality />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <DeliveryQuality />
                        </Grid>
                    </Stack>
                </Card>
            </Grid>
            <Grid item xs={12} md={6}>
                <Card sx={{ height: '36vh' }}>
                    <CardHeader title="Delivery and Inventory Status" sx={{ backgroundColor: 'primary.main', textAlign: 'center', p: 1 }} />
                    <Stack direction="row" spacing={1} sx={{ height: '100%' }}>
                        <Grid item xs={12} md={4}>
                            <DeliveryStatus />
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <InventoryStatus />
                        </Grid>
                    </Stack>
                </Card>
            </Grid>
        </Grid>
    );
}