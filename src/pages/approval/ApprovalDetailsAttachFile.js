import fileFill from '@iconify/icons-eva/file-fill';
import { Icon } from '@iconify/react';
import { Box, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
// material
import { styled } from '@material-ui/core/styles';
import { isString } from 'lodash';
import PropTypes from 'prop-types';
import { fData } from '../../utils/formatNumber';

// ----------------------------------------------------------------------

const DropZoneStyle = styled('div')(({ theme }) => ({
    outline: 'none',
    display: 'flex',
    textAlign: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    margin: theme.spacing(0.5, 0, 0.5, 0),
    backgroundColor: theme.palette.background.neutral,
    border: `1px solid ${theme.palette.grey[500_32]}`,
    '&:hover': { opacity: 0.72, cursor: 'pointer' },
    [theme.breakpoints.up('md')]: { textAlign: 'left', flexDirection: 'row' }
}));
// ----------------------------------------------------------------------

ApprovalDetailsAttachFile.propTypes = {
    approval: PropTypes.object
};

export default function ApprovalDetailsAttachFile({ approval, ...other }) {

    const { attachedFiles } = approval;
    
    const onDownLoadFile = (fileName, downloadUrl) => {
        const link = document.createElement("a");
        link.download = fileName;
        link.href = downloadUrl;
        link.click();
    };
    return (
        <DropZoneStyle {...other}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box sx={{ width: '100%', px: 0.5 }}>
                    {attachedFiles.map((file) => {
                        const { fileName, size, downloadUrl } = file;
                        const key = isString(file) ? file : fileName;
                        return (<ListItem
                            key={key}
                            sx={{
                                my: 0.25,
                                py: 0.25,
                                px: 2,
                                border: (theme) => `solid 1px ${theme.palette.divider}`,
                                bgcolor: 'background.paper',
                                '&:hover': {
                                    cursor: 'pointer'
                                }
                            }}
                            onClick={() => onDownLoadFile(fileName, downloadUrl)}
                        >
                            <ListItemIcon>
                                <Icon icon={fileFill} width={16} height={16} />
                            </ListItemIcon>
                            <ListItemText
                                primary={`${isString(file) ? file : fileName} (${isString(file) ? '' : fData(size)})`}
                                primaryTypographyProps={{ variant: 'subtitle2' }}
                                secondaryTypographyProps={{ variant: 'caption' }}
                            />
                        </ListItem>
                        )
                    })
                    }
                </Box>
            </Box>
        </DropZoneStyle>
    );
}
