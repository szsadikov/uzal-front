import type { JSX } from 'react'
import {
	HiOutlineChat,
	HiOutlineClipboardList,
	HiOutlineCollection, HiOutlineColorSwatch,
	HiOutlineCube,
	HiOutlineHome,
	HiOutlineMap, HiOutlineOfficeBuilding,
	HiOutlineUsers
} from 'react-icons/hi'
import {
	HiOutlineArchiveBox,
	HiOutlineDocumentText,
	HiOutlineInboxArrowDown,
	HiOutlineSquare3Stack3D,
	HiOutlineSquares2X2,
	HiOutlineWindow} from 'react-icons/hi2'

type NavigationIcons = Record<string, JSX.Element>

const navigationIcon: NavigationIcons = {
	HomeIcon: <HiOutlineHome />,
	UsersIcon: <HiOutlineUsers />,
	ApplicationsIcon: <HiOutlineInboxArrowDown />,
	ApplicationsListIcon: <HiOutlineInboxArrowDown />,
	ContractsIcon: <HiOutlineDocumentText />,
	ClientsIcon: <HiOutlineMap />,
	MonitoringIcon: <HiOutlineCube />,
	CatalogIcon: <HiOutlineColorSwatch />,
	CatalogListIcon: <HiOutlineSquares2X2 />,
	WarehouseIcon: <HiOutlineArchiveBox />,
	PaperTrackersIcon: <HiOutlineClipboardList />,
	RequestsIcon: <HiOutlineWindow />,
	SmsServiceIcon: <HiOutlineChat />,
	CollectionIcon: <HiOutlineCollection />,
	SquareIcon : <HiOutlineSquare3Stack3D   />,
	WindowIcon : <HiOutlineWindow    />,
	CompanyIcon: <HiOutlineOfficeBuilding />
}

export default navigationIcon
